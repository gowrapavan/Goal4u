import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LiveContent from './LiveContent';
import ModernSpinner from '../common/ModernSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { LiveMatch as LiveMatchService } from '../../services/live-match';

const LiveMatch = () => {
  const [searchParams] = useSearchParams();
  const matchId = Number(searchParams.get('matchId'));
  const competition = searchParams.get('competition');

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId || !competition) {
      setError('Missing match ID or competition.');
      setLoading(false);
      return;
    }

    const fetchMatch = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent matches (past 7 days + next 7 days)
        const matches = await LiveMatchService.fetchRecentMatches(14);

        // Find the selected match by GameId and Competition
        const selectedMatch = matches.find(
          (m) => Number(m.GameId) === matchId && m.Competition === competition
        );

        if (!selectedMatch) {
          setError('Match not found for the selected date.');
        } else {
          setMatchData(selectedMatch);
        }
      } catch (err) {
        setError(err.message || 'Could not load match details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, competition]);

  if (loading) return <ModernSpinner />;
  if (error)
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return <LiveContent matchData={matchData} />;
};

export default LiveMatch;
