// components/RecentMatches.jsx
import React, { useEffect, useState } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import { MatchService } from '../services/matchService';
import { getTeamLogoByKey } from '../services/teamlogo';

const RecentMatches = () => {
  const [recentMatches, setRecentMatches] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatMatchDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Load team logos once matches are fetched
  const loadTeamLogos = async (matches) => {
    const logos = {};
    for (const match of matches) {
      const homeKey = match.HomeTeamKey;
      const awayKey = match.AwayTeamKey;

      if (!logos[homeKey]) {
        logos[homeKey] =
          (await getTeamLogoByKey(match.Competition, homeKey)) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(homeKey)}&background=007bff&color=fff&size=30`;
      }

      if (!logos[awayKey]) {
        logos[awayKey] =
          (await getTeamLogoByKey(match.Competition, awayKey)) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(awayKey)}&background=dc3545&color=fff&size=30`;
      }
    }

    setTeamLogos(logos);
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const matches = await MatchService.fetchRecentMatches(5);
      setRecentMatches(matches);
      await loadTeamLogos(matches);
    } catch (err) {
      setError('Failed to load recent matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = recentMatches?.filter(
    (match) => match.Status === 'Final' || match.IsClosed
  );

  return (
    <div className="col-lg-4">
      <div className="recent-results">
        <h5>
          <a href="group-list.html">Recent Results (Top 50 Clubs)</a>
        </h5>
        <div className="info-results">
          {loading ? (
            <div className="text-center p-3">
              <LoadingSpinner size="small" message="Loading recent matches..." />
            </div>
          ) : error ? (
            <div className="p-3">
              <ErrorMessage message={error} onRetry={fetchMatches} />
            </div>
          ) : (
            <ul>
              {filteredMatches && filteredMatches.length > 0 ? (
                filteredMatches.slice(0, 4).map((match, index) => (
                  <li key={match.GameId || index}>
                    <span className="head">
                      {match.HomeTeamKey} vs {match.AwayTeamKey}
                      <span className="date">{formatMatchDate(match.DateTime)}</span>
                    </span>
                    <div className="goals-result">
                      <a href="single-team.html">
                        <img
                          src={teamLogos[match.HomeTeamKey]}
                          alt={match.HomeTeamKey}
                        />
                        {match.HomeTeamKey}
                      </a>
                      <span className="goals">
                        <b>{match.HomeTeamScore ?? '-'}</b> - <b>{match.AwayTeamScore ?? '-'}</b>
                      </span>
                      <a href="single-team.html">
                        <img
                          src={teamLogos[match.AwayTeamKey]}
                          alt={match.AwayTeamKey}
                        />
                        {match.AwayTeamKey}
                      </a>
                    </div>
                  </li>
                ))
              ) : (
                <li>
                  <div className="text-center text-muted p-3">
                    <p>No recent matches from top 50 clubs available</p>
                    <button onClick={fetchMatches} className="btn btn-sm btn-outline-primary">
                      Try Again
                    </button>
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      <style jsx>{`
  .goals-result img {
    width: 30px;
    height: 30px;
    object-fit: contain;
    border-radius: 4px;
    margin-right: 6px;
    background-color:rgb(36, 32, 31);
  }

  @media (max-width: 768px) {
    .goals-result img {
      width: 26px;
      height: 26px;
    }
  }

  .goals-result a {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
  }

  .goals-result .goals {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 8px;
    white-space: nowrap;
  }
`}</style>

    </div>
  );
};

export default RecentMatches;
