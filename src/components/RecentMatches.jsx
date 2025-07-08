import React, { useEffect, useState } from 'react';
import Loading from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import { MatchService, getScoreFromBoxScore } from '../services/matchService';
import { getTeamLogoByKey } from '../services/teamlogo';

const RecentMatches = () => {
  const [recentMatches, setRecentMatches] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dynamicScores, setDynamicScores] = useState({}); // Map GameId -> { home: score, away: score }

  const formatMatchDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

      // Filter matches only in the past
      const pastMatches = matches.filter(
        (match) => new Date(match.DateTime).getTime() < Date.now()
      );

      // Only keep top 4
      const sliced = pastMatches.slice(0, 4);

      // Get fallback scores for matches with null score
      const scoreResults = {};
      for (const match of sliced) {
        if (match.HomeTeamScore == null || match.AwayTeamScore == null) {
          try {
            const { homeScore, awayScore } = await getScoreFromBoxScore(match);
            scoreResults[match.GameId] = { homeScore, awayScore };
          } catch {
            // Do nothing, fallback will be vs display
          }
        }
      }

      setRecentMatches(sliced);
      setDynamicScores(scoreResults);
      await loadTeamLogos(sliced);
    } catch (err) {
      console.error(err);
      setError('Failed to load recent matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="col-lg-4">
      <div className="recent-results">
        <h5>
          <a href="group-list.html">Recent Results (Top 50 Clubs)</a>
        </h5>
        <div className="info-results">
          {loading ? (
            <div className="text-center py-4">
              <Loading />
            </div>
          ) : error ? (
            <div className="p-3">
              <ErrorMessage message={error} onRetry={fetchMatches} />
            </div>
          ) : (
            <ul>
              {recentMatches && recentMatches.length > 0 ? (
                recentMatches.map((match, index) => {
                  const score = dynamicScores[match.GameId];
                  const homeScore =
                    match.HomeTeamScore != null
                      ? match.HomeTeamScore
                      : score?.homeScore ?? null;
                  const awayScore =
                    match.AwayTeamScore != null
                      ? match.AwayTeamScore
                      : score?.awayScore ?? null;

                  return (
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
                          {homeScore != null && awayScore != null ? (
                            <>
                              <b>{homeScore}</b> - <b>{awayScore}</b>
                            </>
                          ) : (
                            <>
                              <b>{match.HomeTeamKey}</b> - <b>{match.AwayTeamKey}</b>
                            </>
                          )}
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
                  );
                })
              ) : (
                <li>
                  <div className="text-center text-muted p-3">
                    <p>No recent matches from top 50 clubs available</p>
                    <button
                      onClick={fetchMatches}
                      className="btn btn-sm btn-outline-primary"
                    >
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
          background-color: rgb(36, 32, 31);
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
