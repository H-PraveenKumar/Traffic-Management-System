import React, { useState, useEffect } from 'react';

const MockDemo = () => {
  const [mockData, setMockData] = useState({
    zone_counts: { green_zone: 3, yellow_zone: 7, red_zone: 9 },
    current_signal: 'GREEN',
    time_remaining: 45,
    total_vehicles: 19
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing traffic data
      const newData = {
        zone_counts: {
          green_zone: Math.floor(Math.random() * 8) + 1,
          yellow_zone: Math.floor(Math.random() * 10) + 3,
          red_zone: Math.floor(Math.random() * 12) + 2
        },
        current_signal: ['GREEN', 'YELLOW', 'RED'][Math.floor(Math.random() * 3)],
        time_remaining: Math.floor(Math.random() * 60) + 10,
        total_vehicles: 0
      };
      newData.total_vehicles = newData.zone_counts.green_zone + 
                               newData.zone_counts.yellow_zone + 
                               newData.zone_counts.red_zone;
      setMockData(newData);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSignalClass = (signal) => {
    switch (signal) {
      case 'GREEN': return 'signal-green';
      case 'YELLOW': return 'signal-yellow';
      case 'RED': return 'signal-red';
      default: return 'signal-green';
    }
  };

  const getSignalEmoji = (signal) => {
    switch (signal) {
      case 'GREEN': return '🟢';
      case 'YELLOW': return '🟡';
      case 'RED': return '🔴';
      default: return '🟢';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🚦 Smart Traffic Management System - DEMO MODE</h1>
        <p>Real-time Vehicle Detection & Dynamic Signal Control (Mock Data)</p>
        
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <div className="status-indicator status-online">
            <div className="status-dot"></div>
            Demo Mode Active
          </div>
          
          <div className="status-indicator status-online">
            <div className="status-dot"></div>
            AI Detection Ready
          </div>
        </div>
      </header>

      <main className="dashboard">
        <div className="live-feed-container">
          <h2 className="card-title">🎥 Live Traffic Feed (Demo)</h2>
          
          <div style={{ 
            width: '100%', 
            height: '400px', 
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #3498db',
            color: '#ecf0f1'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📹</div>
            <h3>Camera Feed Simulation</h3>
            <p style={{ textAlign: 'center', maxWidth: '300px', lineHeight: '1.5' }}>
              In live mode, this shows real-time vehicle detection with:
              <br />• YOLOv8 bounding boxes
              <br />• Zone boundary lines
              <br />• 3×3 grid overlay
            </p>
          </div>
          
          <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#bdc3c7' }}>
            <p>📍 Real-time vehicle detection with YOLO v8</p>
            <p>🟢 Green Zone: Low congestion area</p>
            <p>🟡 Yellow Zone: Medium congestion area</p>
            <p>🔴 Red Zone: High congestion area</p>
          </div>
        </div>

        <div className="controls-container">
          <h2 className="card-title">🚦 Traffic Signal Control</h2>
          
          <div className="signal-display">
            <div className={`signal-light ${getSignalClass(mockData.current_signal)}`}>
              {getSignalEmoji(mockData.current_signal)}
            </div>
            
            <div className="countdown">
              {mockData.time_remaining}s
            </div>
            
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
              {mockData.current_signal} SIGNAL
            </div>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#95a5a6' }}>
            <p>🤖 Dynamic timing logic:</p>
            <p>• Red zone {'>'}8 vehicles → 60s green</p>
            <p>• Yellow zone {'>'}5 vehicles → 40s green</p>
            <p>• Otherwise → 30s green</p>
          </div>
        </div>
        
        <div className="stats-container">
          <h2 className="card-title">📊 Vehicle Statistics</h2>
          
          <div className="zone-counts">
            <div className="zone-card green">
              <div className="zone-count" style={{ color: '#27ae60' }}>
                {mockData.zone_counts.green_zone}
              </div>
              <div className="zone-label">Green Zone</div>
            </div>
            
            <div className="zone-card yellow">
              <div className="zone-count" style={{ color: '#f39c12' }}>
                {mockData.zone_counts.yellow_zone}
              </div>
              <div className="zone-label">Yellow Zone</div>
            </div>
            
            <div className="zone-card red">
              <div className="zone-count" style={{ color: '#e74c3c' }}>
                {mockData.zone_counts.red_zone}
              </div>
              <div className="zone-label">Red Zone</div>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '10px', 
            padding: '15px', 
            marginTop: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Vehicles:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                {mockData.total_vehicles}
              </span>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#95a5a6' }}>
            <p>🎯 Detection includes: Cars, Buses, Trucks, Motorcycles</p>
            <p>📐 Grid system: 3×3 cells for congestion analysis</p>
            <p>⏱️ Data updates every 3 seconds (demo mode)</p>
          </div>
        </div>
      </main>
      
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px', 
        color: '#95a5a6', 
        fontSize: '0.9rem',
        borderTop: '1px solid #34495e',
        marginTop: '20px'
      }}>
        <p>🎯 Smart India Hackathon 2025 | Built with YOLOv8, OpenCV, Flask & React</p>
        <p>🚀 Real-time AI-powered traffic management for smart cities</p>
        <p style={{ color: '#e74c3c', marginTop: '10px' }}>
          ⚠️ DEMO MODE - Install Python & Node.js for full live camera functionality
        </p>
      </footer>
    </div>
  );
};

export default MockDemo;
