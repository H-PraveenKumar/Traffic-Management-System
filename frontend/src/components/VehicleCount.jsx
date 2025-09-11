import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VehicleCount = () => {
  const [congestionData, setCongestionData] = useState({
    zone_counts: {
      green_zone: 0,
      yellow_zone: 0,
      red_zone: 0
    },
    total_vehicles: 0,
    occupied_grid_cells: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCongestionData = async () => {
      try {
        const response = await axios.get('/api/congestion');
        setCongestionData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch congestion data');
        console.error('Congestion data error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchCongestionData();

    // Update every 2 seconds
    const interval = setInterval(fetchCongestionData, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="stats-container">
        <h2 className="card-title">📊 Vehicle Statistics</h2>
        <div className="loading">Loading vehicle data...</div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <h2 className="card-title">📊 Vehicle Statistics</h2>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <div className="zone-counts">
        <div className="zone-card green">
          <div className="zone-count" style={{ color: '#27ae60' }}>
            {congestionData.zone_counts.green_zone}
          </div>
          <div className="zone-label">Green Zone</div>
        </div>
        
        <div className="zone-card yellow">
          <div className="zone-count" style={{ color: '#f39c12' }}>
            {congestionData.zone_counts.yellow_zone}
          </div>
          <div className="zone-label">Yellow Zone</div>
        </div>
        
        <div className="zone-card red">
          <div className="zone-count" style={{ color: '#e74c3c' }}>
            {congestionData.zone_counts.red_zone}
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
            {congestionData.total_vehicles}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem' }}>Grid Occupancy:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#9b59b6' }}>
            {congestionData.occupied_grid_cells}/9
          </span>
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '8px', 
          background: 'rgba(255, 255, 255, 0.2)', 
          borderRadius: '4px', 
          marginTop: '10px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${(congestionData.occupied_grid_cells / 9) * 100}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #3498db, #9b59b6)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#95a5a6' }}>
        <p>🎯 Detection includes: Cars, Buses, Trucks, Motorcycles</p>
        <p>📐 Grid system: 3×3 cells for congestion analysis</p>
        <p>⏱️ Updates every 2 seconds</p>
      </div>
    </div>
  );
};

export default VehicleCount;
