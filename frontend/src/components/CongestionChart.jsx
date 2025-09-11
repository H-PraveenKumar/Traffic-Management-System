import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const CongestionChart = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const response = await axios.get('/api/history');
        const history = response.data.history || [];
        
        // Format data for the chart
        const chartData = history.map((entry, index) => ({
          time: new Date(entry.timestamp).toLocaleTimeString(),
          green: entry.zone_counts.green_zone,
          yellow: entry.zone_counts.yellow_zone,
          red: entry.zone_counts.red_zone,
          total: entry.total_vehicles,
          signal: entry.signal_status
        }));
        
        setHistoryData(chartData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch history data');
        console.error('History data error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchHistoryData();

    // Update every 5 seconds
    const interval = setInterval(fetchHistoryData, 5000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(44, 62, 80, 0.95)',
          border: '1px solid #3498db',
          borderRadius: '8px',
          padding: '10px',
          color: 'white'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading">Loading congestion trends...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div className="chart-container">
        <div style={{ textAlign: 'center', color: '#bdc3c7', padding: '40px' }}>
          <p>📈 No historical data available yet</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
            Start the system to begin collecting congestion data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={historyData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#34495e" />
          <XAxis 
            dataKey="time" 
            stroke="#bdc3c7"
            fontSize={12}
          />
          <YAxis 
            stroke="#bdc3c7"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#bdc3c7' }}
          />
          <Line 
            type="monotone" 
            dataKey="green" 
            stroke="#27ae60" 
            strokeWidth={2}
            name="Green Zone"
            dot={{ fill: '#27ae60', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="yellow" 
            stroke="#f39c12" 
            strokeWidth={2}
            name="Yellow Zone"
            dot={{ fill: '#f39c12', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="red" 
            stroke="#e74c3c" 
            strokeWidth={2}
            name="Red Zone"
            dot={{ fill: '#e74c3c', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3498db" 
            strokeWidth={3}
            name="Total Vehicles"
            dot={{ fill: '#3498db', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CongestionChart;
