import React, { useState } from 'react';
import LiveMatchContent from './LiveMatchContent';
import LiveScoreSection from './livescoresection';
import '../../App.css'

const LiveMatch = () => {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <>
      <LiveScoreSection setActiveTab={setActiveTab} />
      <LiveMatchContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};

export default LiveMatch;
