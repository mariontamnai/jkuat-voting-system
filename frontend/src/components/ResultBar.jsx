import React from 'react';

const ResultBar = ({ candidate, rank, isLeader }) => {
  return (
    <div className={`result-bar-container ${isLeader ? 'leader' : ''}`}>
      <div className="result-bar-header">
        <span className="rank">{rank}</span>
        <span className="name">{candidate.name}</span>
        <span className="votes">{candidate.votes} votes</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${candidate.percentage}%` }}
        >
          {candidate.percentage}%
        </div>
      </div>
    </div>
  );
};

export default ResultBar;