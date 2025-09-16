import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBoxScoreById } from '../../services/boxscore';
import LiveContent from './LiveContent';  // ✅ merged component
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const LiveMatch = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const competition = searchParams.get('competition');

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

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
  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    );

  return (
    <LiveContent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      matchData={matchData}
      competition={competition}
    />
  );
};

export default LiveMatch;
