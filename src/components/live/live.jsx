// components/live/Live.jsx
import React from 'react';
import LiveMatchList from './LiveMatchList';
import News from '../News';

const Live = () => {
  return (
    <div className="container py-4">
      {/* Live Matches Section */}
      <div className="mb-5">
        <LiveMatchList />
      </div>

      {/* News Section */}
      <div>
        <News />
      </div>
    </div>
  );
};

export default Live;
