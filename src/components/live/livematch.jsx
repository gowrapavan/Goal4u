// components/live/LiveMatch.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBoxScoreById } from '../../services/boxscore';
import LiveScoreSection from './LiveScoreSection';
import LiveMatchContent from './LiveMatchContent'; // ✅ import
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const LiveMatch = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const competition = searchParams.get('competition');

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('score');

  useEffect(() => {
    if (!matchId || !competition) {
      setError('Missing match ID or competition.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchBoxScoreById(competition, Number(matchId));
        setMatchData(data);
      } catch (err) {
        setError('Could not load match details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId, competition]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <>
      <LiveScoreSection
        setActiveTab={setActiveTab}
        matchData={matchData}
        competition={competition}
      />

      <LiveMatchContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchData={matchData} // ✅ pass this for dynamic stats
        competition={competition}
      />
    </>
  );
};

export default LiveMatch;
