import React from 'react';
import './LoadingDots.css';

function LoadingDots() {
  return (
    <div className="loading-container">
      <span className="loading-text">Thinking</span>
      <span className="loading-dot">.</span>
      <span className="loading-dot">.</span>
      <span className="loading-dot">.</span>
    </div>
  );
}

export default LoadingDots; 