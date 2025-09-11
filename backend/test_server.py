from flask import Flask, jsonify
from flask_cors import CORS
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'Smart Traffic Backend Test Server',
        'status': 'running',
        'available_endpoints': {
            'health': '/api/health',
            'congestion': '/api/congestion',
            'signal_status': '/api/signal-status'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health')
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'camera_active': False,
        'signal_controller_active': False,
        'timestamp': datetime.now().isoformat(),
        'message': 'Backend server is running'
    })

@app.route('/api/congestion')
def get_congestion():
    """Mock congestion data"""
    return jsonify({
        'zone_counts': {
            'green_zone': 5,
            'yellow_zone': 8,
            'red_zone': 12
        },
        'total_vehicles': 25
    })

@app.route('/api/signal-status')
def get_signal_status():
    """Mock signal status"""
    return jsonify({
        'current_signal': 'GREEN',
        'time_remaining': 30,
        'dynamic_timing': True
    })

if __name__ == '__main__':
    print("Starting Smart Traffic Backend Test Server...")
    print("Server will run on: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    app.run(host='0.0.0.0', port=5000, debug=True)
