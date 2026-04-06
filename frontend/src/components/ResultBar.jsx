import React from 'react';

const ResultBar = ({ candidate, rank, isLeader }) => {
  return (
    <div className={`result-item ${isLeader ? 'leader' : ''}`}>
      <div className="result-item-header">
        <div className="result-rank-name">
          <span className={`rank-badge ${isLeader ? 'rank-leader' : ''}`}>{rank}</span>
          <span className="result-name">{candidate.name}</span>
        </div>
        <span className="result-votes">{candidate.votes}</span>
      </div>
      <div className="result-progress">
        <div
          className={`result-fill ${isLeader ? 'fill-leader' : 'fill-other'}`}
          style={{ width: `${candidate.percentage}%` }}
        >
          {candidate.percentage}%
        </div>
      </div>
    </div>
  );
};

export default ResultBar;