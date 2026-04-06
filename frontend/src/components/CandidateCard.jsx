import React from 'react';

const CandidateCard = ({ candidate, selected, onSelect }) => {
  return (
    <div 
      className={`candidate-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(candidate)}
    >
      {selected && (
        <div className="tick-mark">✓</div>
      )}
      <div className="candidate-avatar">
        {candidate.name.split(' ').map(n => n[0]).join('')}
      </div>
      <h3>{candidate.name}</h3>
      <p>{candidate.faculty} | {candidate.year}</p>
    </div>
  );
};

export default CandidateCard;