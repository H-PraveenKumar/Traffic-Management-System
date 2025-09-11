from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import json
import threading
import time
from detection import VehicleDetector
from signal_logic import TrafficSignalController
import mysql.connector
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Initialize components
detector = VehicleDetector()
signal_controller = TrafficSignalController()

# Global variables
camera = None
current_frame = None
congestion_history = []

# Database configuration (optional)
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'traffic_management'
}

def init_camera():
    """Initialize camera (webcam first, then fallback to video file)"""
    global camera
    
    # Try webcam first
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        print("Webcam not available, trying video file...")
        # Fallback to video file if available
        if os.path.exists("traffic.mp4"):
            camera = cv2.VideoCapture("traffic.mp4")
        else:
            print("No video source available!")
            return False
    
    # Set camera properties for better performance
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    camera.set(cv2.CAP_PROP_FPS, 30)
    
    return True

def save_to_database(congestion_data):
    """Save congestion data to MySQL database (optional)"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        query = """
        INSERT INTO congestion_data 
        (timestamp, green_zone_count, yellow_zone_count, red_zone_count, signal_status)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        values = (
            datetime.now(),
            congestion_data['zone_counts']['green_zone'],
            congestion_data['zone_counts']['yellow_zone'],
            congestion_data['zone_counts']['red_zone'],
            signal_controller.current_signal
        )
        
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error saving to database: {e}")

def generate_frames():
    """Generate video frames with vehicle detection"""
    global current_frame, congestion_history
    
    while True:
        if camera is None or not camera.isOpened():
            break
            
        success, frame = camera.read()
        if not success:
            # If using video file, loop it
            if hasattr(camera, 'get') and camera.get(cv2.CAP_PROP_POS_FRAMES) == camera.get(cv2.CAP_PROP_FRAME_COUNT):
                camera.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        
        # Detect vehicles and get annotated frame
        annotated_frame = detector.detect_vehicles(frame)
        current_frame = annotated_frame
        
        # Get congestion data
        congestion_data = detector.get_congestion_data()
        
        # Update signal timing based on congestion
        signal_controller.calculate_dynamic_timing(congestion_data)
        
        # Store congestion history (keep last 100 entries)
        congestion_history.append({
            **congestion_data,
            'signal_status': signal_controller.current_signal
        })
        if len(congestion_history) > 100:
            congestion_history.pop(0)
        
        # Save to database (optional)
        # save_to_database(congestion_data)
        
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS

@app.route('/')
def home():
    """Root endpoint with system information"""
    return jsonify({
        'message': 'Smart Traffic Management System',
        'status': 'running',
        'camera_active': camera is not None and camera.isOpened(),
        'signal_controller_active': signal_controller.running,
        'available_endpoints': {
            'health': '/api/health',
            'live_feed': '/api/live-feed',
            'congestion': '/api/congestion',
            'signal_status': '/api/signal-status',
            'history': '/api/history',
            'stats': '/api/stats',
            'force_signal': '/api/force-signal (POST)'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/live-feed')
def live_feed():
    """Stream live video feed with vehicle detection"""
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/congestion')
def get_congestion():
    """Get current congestion data"""
    congestion_data = detector.get_congestion_data()
    return jsonify(congestion_data)

@app.route('/api/signal-status')
def get_signal_status():
    """Get current traffic signal status"""
    signal_status = signal_controller.get_signal_status()
    return jsonify(signal_status)

@app.route('/api/history')
def get_history():
    """Get congestion history"""
    return jsonify({
        'history': congestion_history[-50:],  # Last 50 entries
        'total_entries': len(congestion_history)
    })

@app.route('/api/force-signal', methods=['POST'])
def force_signal():
    """Force signal change (for testing)"""
    data = request.get_json()
    signal = data.get('signal', '').upper()
    
    if signal in ['GREEN', 'YELLOW', 'RED']:
        signal_controller.force_signal_change(signal)
        return jsonify({'success': True, 'message': f'Signal changed to {signal}'})
    else:
        return jsonify({'success': False, 'message': 'Invalid signal'}), 400

@app.route('/api/stats')
def get_stats():
    """Get overall system statistics"""
    if not congestion_history:
        return jsonify({'message': 'No data available'})
    
    # Calculate averages
    total_entries = len(congestion_history)
    avg_green = sum(entry['zone_counts']['green_zone'] for entry in congestion_history) / total_entries
    avg_yellow = sum(entry['zone_counts']['yellow_zone'] for entry in congestion_history) / total_entries
    avg_red = sum(entry['zone_counts']['red_zone'] for entry in congestion_history) / total_entries
    avg_total = sum(entry['total_vehicles'] for entry in congestion_history) / total_entries
    
    return jsonify({
        'total_entries': total_entries,
        'averages': {
            'green_zone': round(avg_green, 2),
            'yellow_zone': round(avg_yellow, 2),
            'red_zone': round(avg_red, 2),
            'total_vehicles': round(avg_total, 2)
        },
        'current_signal': signal_controller.current_signal,
        'dynamic_green_duration': signal_controller.dynamic_green_duration
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'camera_active': camera is not None and camera.isOpened(),
        'signal_controller_active': signal_controller.running,
        'timestamp': datetime.now().isoformat()
    })

def cleanup():
    """Cleanup resources"""
    global camera
    if camera:
        camera.release()
    signal_controller.stop()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    try:
        print("Initializing Smart Traffic Management System...")
        
        # Initialize camera
        if not init_camera():
            print("Failed to initialize camera!")
            exit(1)
        
        print("Camera initialized successfully!")
        print("Starting Flask server...")
        print("Access the system at: http://localhost:5000")
        print("Live feed available at: http://localhost:5000/api/live-feed")
        
        # Start the Flask app
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
        
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        cleanup()
