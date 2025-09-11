import time
from datetime import datetime, timedelta
import threading

class TrafficSignalController:
    def __init__(self):
        self.current_signal = "GREEN"
        self.signal_start_time = datetime.now()
        self.signal_duration = 30  # Default 30 seconds
        self.time_remaining = self.signal_duration
        
        # Signal cycle: GREEN -> YELLOW -> RED -> GREEN
        self.signal_cycle = ["GREEN", "YELLOW", "RED"]
        self.current_cycle_index = 0
        
        # Default durations (in seconds)
        self.default_durations = {
            "GREEN": 30,
            "YELLOW": 5,
            "RED": 25
        }
        
        # Dynamic duration based on congestion
        self.dynamic_green_duration = 30
        
        # Start the signal timer thread
        self.running = True
        self.timer_thread = threading.Thread(target=self._signal_timer, daemon=True)
        self.timer_thread.start()
    
    def calculate_dynamic_timing(self, congestion_data):
        """Calculate dynamic signal timing based on congestion"""
        zone_counts = congestion_data.get("zone_counts", {})
        red_zone_count = zone_counts.get("red_zone", 0)
        yellow_zone_count = zone_counts.get("yellow_zone", 0)
        
        # Dynamic green signal timing logic
        if red_zone_count > 8:
            self.dynamic_green_duration = 60
        elif yellow_zone_count > 5:
            self.dynamic_green_duration = 40
        else:
            self.dynamic_green_duration = 30
    
    def _signal_timer(self):
        """Background timer for signal changes"""
        while self.running:
            current_time = datetime.now()
            elapsed = (current_time - self.signal_start_time).total_seconds()
            
            # Calculate time remaining
            if self.current_signal == "GREEN":
                duration = self.dynamic_green_duration
            else:
                duration = self.default_durations[self.current_signal]
            
            self.time_remaining = max(0, duration - elapsed)
            
            # Check if signal should change
            if elapsed >= duration:
                self._change_signal()
            
            time.sleep(1)  # Update every second
    
    def _change_signal(self):
        """Change to the next signal in the cycle"""
        self.current_cycle_index = (self.current_cycle_index + 1) % len(self.signal_cycle)
        self.current_signal = self.signal_cycle[self.current_cycle_index]
        self.signal_start_time = datetime.now()
        
        # Set duration for new signal
        if self.current_signal == "GREEN":
            self.signal_duration = self.dynamic_green_duration
        else:
            self.signal_duration = self.default_durations[self.current_signal]
        
        self.time_remaining = self.signal_duration
        
        print(f"Signal changed to {self.current_signal} for {self.signal_duration} seconds")
    
    def get_signal_status(self):
        """Get current signal status"""
        return {
            "current_signal": self.current_signal,
            "time_remaining": int(self.time_remaining),
            "signal_duration": self.signal_duration,
            "dynamic_green_duration": self.dynamic_green_duration,
            "timestamp": datetime.now().isoformat()
        }
    
    def force_signal_change(self, signal):
        """Manually force a signal change (for testing)"""
        if signal in self.signal_cycle:
            self.current_signal = signal
            self.current_cycle_index = self.signal_cycle.index(signal)
            self.signal_start_time = datetime.now()
            
            if signal == "GREEN":
                self.signal_duration = self.dynamic_green_duration
            else:
                self.signal_duration = self.default_durations[signal]
            
            self.time_remaining = self.signal_duration
    
    def stop(self):
        """Stop the signal controller"""
        self.running = False
