import React from 'react';

const Statistics = ({ statistics }) => {
  if (!statistics || statistics.length < 2) {
    return null;
  }

  return (
    <div className="stats-section-pro">
      <h2 className="stats-title-pro">Match Statistics</h2>
      {statistics[0].statistics.map((stat, index) => {
        const homeValue = statistics[0].statistics[index]?.value ?? 0;
        const awayValue = statistics[1].statistics[index]?.value ?? 0;
        const total = (Number(String(homeValue).replace('%','')) || 0) + (Number(String(awayValue).replace('%','')) || 0);
        const homeWidth = total > 0 ? ((Number(String(homeValue).replace('%','')) || 0) / total) * 100 : 50;
        
        return (
          <div key={index} className="stats-comparison">
            <div className="stats-value" style={{ textAlign: 'right' }}>{homeValue}</div>
            <div className="stats-label">{stat.type}</div>
            <div className="stats-value" style={{ textAlign: 'left' }}>{awayValue}</div>
            <div className="stats-bar-container">
              <div className="stats-bar-home" style={{ width: `${homeWidth}%` }}></div>
              <div className="stats-bar-away" style={{ width: `${100 - homeWidth}%` }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Statistics;