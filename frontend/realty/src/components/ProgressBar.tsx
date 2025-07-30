import React from "react";
import "./components.css";

interface ProgressBarProps {
  progress: number;
  message?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="progress-modal-container">
      {message && <p className="progress-message">{message}</p>}
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
          <span className="progress-bar-label">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
