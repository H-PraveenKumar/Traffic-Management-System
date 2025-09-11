import cv2
import numpy as np
from ultralytics import YOLO
import time
from datetime import datetime

class VehicleDetector:
    def __init__(self):
        # Load YOLOv8 nano model
        self.model = YOLO('yolov8n.pt')
        
        # Vehicle classes from COCO dataset
        self.vehicle_classes = {
            2: 'car',
            3: 'motorcycle', 
            5: 'bus',
            7: 'truck'
        }
        
        # Zone boundaries (as percentages of frame height)
        self.green_zone = 0.7  # Bottom 30%
        self.yellow_zone = 0.4  # Middle 30%
        self.red_zone = 0.1    # Top 30%
        
        # Grid system (3x3)
        self.grid_rows = 3
        self.grid_cols = 3
        
        # Congestion data
        self.zone_counts = {"green_zone": 0, "yellow_zone": 0, "red_zone": 0}
        self.grid_occupancy = [[False for _ in range(self.grid_cols)] for _ in range(self.grid_rows)]
        
    def draw_boundary_lines(self, frame):
        """Draw virtual boundary lines on the frame"""
        height, width = frame.shape[:2]
        
        # Green line (bottom)
        green_y = int(height * self.green_zone)
        cv2.line(frame, (0, green_y), (width, green_y), (0, 255, 0), 3)
        cv2.putText(frame, "GREEN ZONE", (10, green_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Yellow line (middle)
        yellow_y = int(height * self.yellow_zone)
        cv2.line(frame, (0, yellow_y), (width, yellow_y), (0, 255, 255), 3)
        cv2.putText(frame, "YELLOW ZONE", (10, yellow_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # Red line (top)
        red_y = int(height * self.red_zone)
        cv2.line(frame, (0, red_y), (width, red_y), (0, 0, 255), 3)
        cv2.putText(frame, "RED ZONE", (10, red_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        return frame
    
    def draw_grid(self, frame):
        """Draw 3x3 grid overlay"""
        height, width = frame.shape[:2]
        
        # Vertical lines
        for i in range(1, self.grid_cols):
            x = int(width * i / self.grid_cols)
            cv2.line(frame, (x, 0), (x, height), (128, 128, 128), 1)
        
        # Horizontal lines
        for i in range(1, self.grid_rows):
            y = int(height * i / self.grid_rows)
            cv2.line(frame, (0, y), (width, y), (128, 128, 128), 1)
        
        return frame
    
    def get_zone(self, y_center, frame_height):
        """Determine which zone a vehicle is in based on y-coordinate"""
        y_ratio = y_center / frame_height
        
        if y_ratio >= self.green_zone:
            return "green_zone"
        elif y_ratio >= self.yellow_zone:
            return "yellow_zone"
        else:
            return "red_zone"
    
    def get_grid_cell(self, x_center, y_center, frame_width, frame_height):
        """Get grid cell coordinates for a point"""
        col = min(int(x_center / frame_width * self.grid_cols), self.grid_cols - 1)
        row = min(int(y_center / frame_height * self.grid_rows), self.grid_rows - 1)
        return row, col
    
    def detect_vehicles(self, frame):
        """Detect vehicles in the frame and return annotated frame with data"""
        height, width = frame.shape[:2]
        
        # Reset counts and grid
        self.zone_counts = {"green_zone": 0, "yellow_zone": 0, "red_zone": 0}
        self.grid_occupancy = [[False for _ in range(self.grid_cols)] for _ in range(self.grid_rows)]
        
        # Run YOLO detection
        results = self.model(frame, verbose=False)
        
        # Process detections
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get class and confidence
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    # Only process vehicle classes with good confidence
                    if cls in self.vehicle_classes and conf > 0.3:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                        
                        # Calculate center point
                        x_center = (x1 + x2) // 2
                        y_center = (y1 + y2) // 2
                        
                        # Determine zone
                        zone = self.get_zone(y_center, height)
                        self.zone_counts[zone] += 1
                        
                        # Mark grid cell as occupied
                        row, col = self.get_grid_cell(x_center, y_center, width, height)
                        self.grid_occupancy[row][col] = True
                        
                        # Draw bounding box
                        color = (0, 255, 0) if zone == "green_zone" else (0, 255, 255) if zone == "yellow_zone" else (0, 0, 255)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        
                        # Draw label
                        label = f"{self.vehicle_classes[cls]} {conf:.2f}"
                        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Draw boundary lines and grid
        frame = self.draw_boundary_lines(frame)
        frame = self.draw_grid(frame)
        
        # Add zone counts to frame
        cv2.putText(frame, f"Green: {self.zone_counts['green_zone']}", (width - 150, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, f"Yellow: {self.zone_counts['yellow_zone']}", (width - 150, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.putText(frame, f"Red: {self.zone_counts['red_zone']}", (width - 150, 90), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        return frame
    
    def get_congestion_data(self):
        """Get current congestion data"""
        occupied_cells = sum(sum(row) for row in self.grid_occupancy)
        
        return {
            "zone_counts": self.zone_counts,
            "occupied_grid_cells": occupied_cells,
            "total_vehicles": sum(self.zone_counts.values()),
            "timestamp": datetime.now().isoformat()
        }
