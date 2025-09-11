import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveFeed from './components/LiveFeed';
import SignalStatus from './components/SignalStatus';
import VehicleCount from './components/VehicleCount';
import CongestionChart from './components/CongestionChart';
import MockDemo from './MockDemo';
import './index.css';

function App() {
  const [demoMode, setDemoMode] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    status: 'unknown',
    camera_active: false,
    signal_controller_active: false
  });

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await axios.get('/api/health');
        setSystemHealth(response.data);
        setDemoMode(false);
      } catch (err) {
        setSystemHealth({
          status: 'error',
          camera_active: false,
          signal_controller_active: false
        });
        setDemoMode(true); // Enable demo mode if backend is not available
      }
    };

    // Check health immediately and then every 10 seconds
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 10000);

    return () => clearInterval(interval);
  }, []);

  // If demo mode is enabled, show the mock demo
  if (demoMode) {
    return <MockDemo />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🚦 Smart Traffic Management System</h1>
        <p>Real-time Vehicle Detection & Dynamic Signal Control</p>
        
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <div className={`status-indicator ${systemHealth.camera_active ? 'status-online' : 'status-offline'}`}>
            <div className="status-dot"></div>
            Camera {systemHealth.camera_active ? 'Online' : 'Offline'}
          </div>
          
          <div className={`status-indicator ${systemHealth.signal_controller_active ? 'status-online' : 'status-offline'}`}>
            <div className="status-dot"></div>
            Signal Controller {systemHealth.signal_controller_active ? 'Active' : 'Inactive'}
          </div>
          
          <div className={`status-indicator ${systemHealth.status === 'healthy' ? 'status-online' : 'status-offline'}`}>
            <div className="status-dot"></div>
            System {systemHealth.status === 'healthy' ? 'Healthy' : 'Error'}
          </div>
        </div>
      </header>

      <main className="dashboard">
        <LiveFeed />
        <SignalStatus />
        
        <div className="stats-container">
          <VehicleCount />
          
          <div style={{ marginTop: '30px' }}>
            <h2 className="card-title">📈 Congestion Trends</h2>
            <CongestionChart />
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
      </footer>
    </div>
  );
}

export default App;
