import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FixtureService } from '../../services/fixture'; // adjust path
import { getTeamLogoByKey } from '../../services/teamlogo';
import ModernSpinner from '../common/ModernSpinner';
import ErrorMessage from '../common/ErrorMessage';

const COMPETITION_NAMES = {
  EPL: 'Premier League',
  ESP: 'La Liga',
  ITSA: 'Serie A',
  DEB: 'Bundesliga',
  FRL1: 'Ligue 1',
  CWC: 'FIFA Club World Cup',
  UCL: 'UEFA Champions League',
};

const TeamFixtures = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get("q");
    if (!encoded) {
      setError("Missing team query.");
      return;
    }

    try {
      const decoded = atob(encoded); // e.g. ESP_605
      const [comp, teamId] = decoded.split("_");

      fetchFixtures(comp, parseInt(teamId));
    } catch {
      setError("Invalid query.");
    }
  }, [location.search]);

  const fetchFixtures = async (competition, teamId) => {
    setLoading(true);
    try {
      const allMatches = await FixtureService.fetchMatches(competition);
      const teamMatches = allMatches
        .filter(match => match.HomeTeamId === teamId || match.AwayTeamId === teamId)
        .sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));

      setMatches(teamMatches);
      await loadTeamLogos(teamMatches, competition);
      setError(null);
    } catch (err) {
      setError("Failed to load team fixtures.");
    } finally {
      setLoading(false);
    }
  };

  const loadTeamLogos = async (matches, competition) => {
    const logos = {};
    for (const match of matches) {
      for (const teamKey of [match.HomeTeamKey, match.AwayTeamKey]) {
        if (!logos[teamKey]) {
          try {
            logos[teamKey] =
              (await getTeamLogoByKey(competition, teamKey)) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(teamKey)}&background=6c757d&color=fff&size=30`;
          } catch {
            logos[teamKey] = `https://ui-avatars.com/api/?name=${encodeURIComponent(teamKey)}&background=6c757d&color=fff&size=30`;
          }
        }
      }
    }
    setTeamLogos(logos);
  };

  const renderStatusTag = (status) => {
    const statusText = status === 'InProgress' ? 'Live' : status === 'Final' ? 'Final' : 'Scheduled';
    const statusClass =
      status === 'InProgress' ? 'status live' : status === 'Final' ? 'status final' : 'status scheduled';
    return <div className={statusClass}>{statusText}</div>;
  };

  return (
    <div className="container mt-3">
      <h4 className="mb-3">Team Fixtures</h4>
      {loading ? (
        <ModernSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : matches.length === 0 ? (
        <p>No upcoming matches for this team.</p>
      ) : (
        <ul className="list-unstyled">
          {matches.map((match) => {
            const date = new Date(match.DateTime.endsWith('Z') ? match.DateTime : match.DateTime + 'Z');
            return (
              <li key={match.GameId} className="border rounded p-2 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted small">
                    {COMPETITION_NAMES[match.Competition] || match.Competition}
                  </span>
                  <span className="text-muted small">
                    {date.toLocaleDateString()} - {date.toLocaleTimeString()}
                  </span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center">
                    <img src={teamLogos[match.HomeTeamKey]} alt="" style={{ width: 28, marginRight: 8 }} />
                    {match.HomeTeamKey}
                  </span>
                  <span className="fw-bold">{match.HomeTeamScore ?? '-'} - {match.AwayTeamScore ?? '-'}</span>
                  <span className="d-flex align-items-center">
                    {match.AwayTeamKey}
                    <img src={teamLogos[match.AwayTeamKey]} alt="" style={{ width: 28, marginLeft: 8 }} />
                  </span>
                </div>
                <div className="text-center mt-1">{renderStatusTag(match.Status)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TeamFixtures;
