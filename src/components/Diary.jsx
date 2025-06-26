import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextPreferredClubMatches } from '../services/diary';
import { getTeamLogoByKey } from '../services/teamlogo';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import EmptyState from './common/EmptyState';

const PREFERRED_CLUBS = [
  // La Liga
  'Real Madrid CF',
  'FC Barcelona',
  'Atlético de Madrid',
  'Sevilla FC',
  'Real Sociedad',

  // Premier League
  'Manchester City FC',
  'Arsenal FC',
  'Liverpool FC',
  'Manchester United FC',
  'Chelsea FC',
  'Tottenham Hotspur FC',
  'Newcastle United FC',

  // Serie A
  'AC Milan',
  'FC Internazionale Milano',
  'Juventus FC',
  'AS Roma',
  'SSC Napoli',
  'Atalanta BC',

  // Bundesliga
  'FC Bayern München',
  'Borussia Dortmund',
  'RB Leipzig',
  'Bayer 04 Leverkusen',
  'Eintracht Frankfurt',

  // Ligue 1
  'Paris Saint-Germain FC',
  'Olympique de Marseille',
  'AS Monaco FC',
  'Olympique Lyonnais',
  'LOSC Lille',
];

const COMPETITION_CODE_MAP = {
  'Premier League': 'EPL',
  'La Liga': 'ESP',
  'Serie A': 'ITSA',
  'Bundesliga': 'DEB',
  'Ligue 1': 'FRL1',
  'FIFA Club World Cup': 'CWC',
  'UEFA Champions League': 'UCL',
};

const Diary = () => {
  const [matches, setMatches] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const formattedDate = date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase();

    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${formattedDate} - ${formattedTime}`;
  };

  const loadTeamLogos = async (matches) => {
    const logos = {};
    for (const match of matches) {
      const compCode = COMPETITION_CODE_MAP[match.Competition] || match.Competition;
      for (const teamKey of [match.HomeTeamKey, match.AwayTeamKey]) {
        if (!logos[teamKey]) {
          logos[teamKey] =
            (await getTeamLogoByKey(compCode, teamKey)) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(teamKey)}&background=007bff&color=fff&size=30`;
        }
      }
    }
    setTeamLogos(logos);
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const result = await getNextPreferredClubMatches(PREFERRED_CLUBS, 4);
        setMatches(result);
        await loadTeamLogos(result);
      } catch (err) {
        console.error(err);
        setError('Failed to load preferred matches.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4>
           Matches
          </h4>
        </div>
        <LoadingSpinner size="small" message="Loading matches..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4>
           Matches
          </h4>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4>
           Matches
          </h4>
        </div>
        <EmptyState icon="fa-calendar" title="No fixtures" description="No upcoming matches scheduled." />
      </div>
    );
  }

  return (
    <div className="panel-box">
      <div className="titles">
        <h4>
         Matches
        </h4>
      </div>

      <ul className="list-diary">
        {matches.map((match, index) => (
          <li
            key={match.GameId || index}
            className="match-card"
            onClick={() =>
              navigate(
                `/livematch?matchId=${match.GameId}&competition=${
                  COMPETITION_CODE_MAP[match.Competition] || match.Competition
                }`
              )
            }
          >
            <h6>
              {match.Competition?.trim().length > 0
                ? match.Competition
                : match.Group?.length > 0 && match.Group.length <= 5
                ? `GROUP ${match.Group}`
                : 'MATCH'}
              <span>{formatDateTime(match.DateTime)}</span>
            </h6>
            <ul className="club-logo">
              <li>
                <img
                  src={teamLogos[match.HomeTeamKey]}
                  alt={match.HomeTeamKey}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      match.HomeTeamKey?.charAt(0) || 'H'
                    )}&background=007bff&color=fff&size=30`;
                  }}
                />
                <span>{match.HomeTeamKey}</span>
              </li>
              <li>
                <img
                  src={teamLogos[match.AwayTeamKey]}
                  alt={match.AwayTeamKey}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      match.AwayTeamKey?.charAt(0) || 'A'
                    )}&background=dc3545&color=fff&size=30`;
                  }}
                />
                <span>{match.AwayTeamKey}</span>
              </li>
            </ul>
          </li>
        ))}
      </ul>

      {/* Styles */}
      <style jsx>{`
        .club-logo img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 4px;
          background-color: #f8f9fa;
          margin-right: 6px;
        }

        .club-logo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0;
          list-style: none;
          margin-top: 8px;
        }

        .club-logo li {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.875rem;
          text-align: center;
        }

        .club-logo span {
          margin-top: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .match-card {
          cursor: pointer;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 10px;
          transition: background 0.2s ease;
        }

        .match-card:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default Diary;
