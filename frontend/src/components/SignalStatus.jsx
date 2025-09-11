import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SignalStatus = () => {
  const [signalData, setSignalData] = useState({
    current_signal: 'GREEN',
    time_remaining: 30,
    signal_duration: 30,
    dynamic_green_duration: 30
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignalStatus = async () => {
      try {
        const response = await axios.get('/api/signal-status');
        setSignalData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch signal status');
        console.error('Signal status error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchSignalStatus();

    // Update every second
    const interval = setInterval(fetchSignalStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const forceSignalChange = async (signal) => {
    try {
      await axios.post('/api/force-signal', { signal });
    } catch (err) {
      console.error('Failed to change signal:', err);
    }
  };

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

  if (loading) {
    return (
      <div className="controls-container">
        <h2 className="card-title">🚦 Traffic Signal Control</h2>
        <div className="loading">Loading signal status...</div>
      </div>
    );
  }

  return (
    <div className="controls-container">
      <h2 className="card-title">🚦 Traffic Signal Control</h2>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <div className="signal-display">
        <div className={`signal-light ${getSignalClass(signalData.current_signal)}`}>
          {getSignalEmoji(signalData.current_signal)}
        </div>
        
        <div className="countdown">
          {signalData.time_remaining}s
        </div>
        
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
          {signalData.current_signal} SIGNAL
        </div>
        
        <div style={{ fontSize: '0.9rem', color: '#bdc3c7' }}>
          Duration: {signalData.signal_duration}s
        </div>
        
        {signalData.current_signal === 'GREEN' && (
          <div style={{ fontSize: '0.8rem', color: '#3498db', marginTop: '5px' }}>
            Dynamic timing: {signalData.dynamic_green_duration}s
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#ecf0f1' }}>
          Manual Control (Testing)
        </h3>
        <div className="control-buttons">
          <button 
            className="control-btn green"
            onClick={() => forceSignalChange('GREEN')}
          >
            Green
          </button>
          <button 
            className="control-btn yellow"
            onClick={() => forceSignalChange('YELLOW')}
          >
            Yellow
          </button>
          <button 
            className="control-btn red"
            onClick={() => forceSignalChange('RED')}
          >
            Red
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#95a5a6' }}>
        <p>🤖 Automatic timing based on congestion:</p>
        <p>• Red zone > 8 vehicles → 60s green</p>
        <p>• Yellow zone > 5 vehicles → 40s green</p>
        <p>• Otherwise → 30s green</p>
      </div>
    </div>
  );
};

export default SignalStatus;
