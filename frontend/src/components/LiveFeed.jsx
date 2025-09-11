import React, { useState, useEffect } from 'react';

const LiveFeed = () => {
  const [feedError, setFeedError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setFeedError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setFeedError(true);
  };

  useEffect(() => {
    // Reset loading state when component mounts
    setIsLoading(true);
    setFeedError(false);
  }, []);

  return (
    <div className="live-feed-container">
      <h2 className="card-title">🎥 Live Traffic Feed</h2>
      
      {isLoading && (
        <div className="loading">
          Loading camera feed...
        </div>
      )}
      
      {feedError && (
        <div className="error">
          ⚠️ Camera feed unavailable. Please ensure the backend is running and camera is accessible.
        </div>
      )}
      
      <img
        src="/api/live-feed"
        alt="Live Traffic Feed"
        className="live-feed"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: feedError ? 'none' : 'block' }}
      />
      
      <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#bdc3c7' }}>
        <p>📍 Real-time vehicle detection with YOLO v8</p>
        <p>🟢 Green Zone: Low congestion area</p>
        <p>🟡 Yellow Zone: Medium congestion area</p>
        <p>🔴 Red Zone: High congestion area</p>
      </div>
    </div>
  );
};

export default LiveFeed;
