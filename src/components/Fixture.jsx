import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixtureService } from '../services/fixture';
import { getTeamLogoByKey } from '../services/teamlogo';
import ModernSpinner from './common/ModernSpinner';
import ErrorMessage from './common/ErrorMessage';

const COMPETITION_NAMES = {
  EPL: 'Premier League',
  DEB: 'Bundesliga',
  ITSA: 'Serie A',
  FRL1: 'Ligue 1',
  NLC: 'Eredivisie',
  PTC: 'Primeira Liga',
  MLS: 'Major League Soccer',
  SPL: 'Scottish Premiership',
  SKC: 'K League 1',
  CWC: 'FIFA Club World Cup',
  UCL: 'UEFA Champions League',
  ELC: 'EFL Championship',
  UEL: 'UEFA Europa League',
  UNL: 'UEFA Nations League',
  UEQ: 'Euro Qualifiers',
  EFAC: 'FA Cup',
  SAWQ: 'South America WC Qualifiers',
  ASWQ: 'Asia WC Qualifiers',
  AFWQ: 'Africa WC Qualifiers',
  NAWQ: 'North America WC Qualifiers',
  OWQ: 'Oceania WC Qualifiers'
};



const Fixture = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const allData = await FixtureService.fetchMatches();

        const upcoming = allData
  .filter((match) => {
    const matchTime = new Date(match.DateTime ?? '');
    const now = new Date();
    return matchTime.getTime() > now.getTime() - 2 * 60 * 60 * 1000;
  })
  .sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));


        let filtered;

        if (selectedDate) {
          filtered = upcoming.filter((match) => {
            const matchUTC = new Date(match.DateTime.endsWith('Z') ? match.DateTime : match.DateTime + 'Z');
            const localDate = new Date(
              matchUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
            )
              .toISOString()
              .split('T')[0];
            return localDate === selectedDate;
          });
        } else {
          filtered = upcoming.slice(0, 10);
        }

        setMatches(filtered);
        await loadTeamLogos(filtered);
        setError(null);
      } catch (err) {
        setError('Failed to load fixtures.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedDate]);

  const loadTeamLogos = async (matches) => {
    const logos = {};
    for (const match of matches) {
      const homeKey = match.HomeTeamKey;
      const awayKey = match.AwayTeamKey;

      if (!logos[homeKey]) {
        try {
          logos[homeKey] =
            (await getTeamLogoByKey(match.Competition, homeKey)) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(homeKey)}&background=6c757d&color=fff&size=30`;
        } catch {
          logos[homeKey] = `https://ui-avatars.com/api/?name=${encodeURIComponent(homeKey)}&background=6c757d&color=fff&size=30`;
        }
      }

      if (!logos[awayKey]) {
        try {
          logos[awayKey] =
            (await getTeamLogoByKey(match.Competition, awayKey)) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(awayKey)}&background=6c757d&color=fff&size=30`;
        } catch {
          logos[awayKey] = `https://ui-avatars.com/api/?name=${encodeURIComponent(awayKey)}&background=6c757d&color=fff&size=30`;
        }
      }
    }
    setTeamLogos(logos);
  };

  const formatDate = (iso) => {
    const date = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  const groupMatches = (matches) => {
    const grouped = {};
    matches.forEach((match) => {
      const dateKey = formatDate(match.DateTime);
      if (!grouped[dateKey]) grouped[dateKey] = {};
      const comp = match.Competition;
      if (!grouped[dateKey][comp]) grouped[dateKey][comp] = [];
      grouped[dateKey][comp].push(match);
    });
    return grouped;
  };

  const renderStatusTag = (status) => {
    const statusText =
      status === 'InProgress' ? 'Live' : status === 'Final' ? 'Final' : 'Scheduled';
    const statusClass =
      status === 'InProgress'
        ? 'status live'
        : status === 'Final'
        ? 'status final'
        : 'status scheduled';
    return <div className={statusClass}>{statusText}</div>;
  };

  const groupedMatches = groupMatches(matches);

  return (
    <div className="live-match-list container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Fixtures</h3>
        <input
          type="date"
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-control"
          style={{ maxWidth: '200px' }}
        />
      </div>

      {loading ? (
        <ModernSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : matches.length === 0 ? (
        <p className="text-muted">No matches found for this date.</p>
      ) : (
        <div className="fade-in">
          {Object.keys(groupedMatches).map((date) => (
            <div key={date} className="mb-4">
              <h5 className="text-primary mt-3">{date}</h5>
              {Object.keys(groupedMatches[date]).map((comp) => (
                <div key={comp} className="mb-3">
                  <h6 className="text-dark">{COMPETITION_NAMES[comp] || comp}</h6>
                  <ul className="match-list list-unstyled">
                    {groupedMatches[date][comp].map((match) => {
                      const utcDate = new Date(match.DateTime.endsWith('Z') ? match.DateTime : match.DateTime + 'Z');
                      return (
                        <li
                          key={match.GameId}
                          className="mb-3 p-2 border rounded text-center"
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            navigate(`/livematch?matchId=${match.GameId}&competition=${match.Competition}`)
                          }
                        >
                          <div className="match-header d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small fw-medium text-start">
                              {COMPETITION_NAMES[match.Competition] || match.Competition}
                            </span>
                            <span className="fw-bold match-center-text d-none d-md-inline">
                              {match.HomeTeamKey} vs {match.AwayTeamKey}
                            </span>
                            <span className="date small text-muted text-end">
                              {utcDate.toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'UTC',
                              })}{' '}
                              |{' '}
                              {utcDate.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'Asia/Kolkata',
                              })}
                            </span>
                          </div>

                          <div className="goals-result d-flex align-items-center justify-content-between">
                            <span className="d-flex align-items-center text-dark">
                              <img src={teamLogos[match.HomeTeamKey]} alt={match.HomeTeamKey} />
                              {match.HomeTeamKey}
                            </span>
                            <span className="goals">
                              <b>{match.HomeTeamScore ?? '-'}</b> - <b>{match.AwayTeamScore ?? '-'}</b>
                            </span>
                            <span className="d-flex align-items-center text-dark justify-content-end">
                              {match.AwayTeamKey}
                              <img src={teamLogos[match.AwayTeamKey]} alt={match.AwayTeamKey} className="ms-1" />
                            </span>
                          </div>

                          <div className="text-center mt-2">{renderStatusTag(match.Status)}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .match-header {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .match-header .match-center-text {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-weight: bold;
          color: #212529;
        }

        @media (max-width: 768px) {
          .match-header .match-center-text {
            display: none;
          }
        }

        .goals-result img {
          width: 30px;
          height: 30px;
          object-fit: contain;
          border-radius: 4px;
          margin: 0 6px;
          background-color: #f8f9fa;
        }

        @media (max-width: 768px) {
          .goals-result img {
            width: 26px;
            height: 26px;
          }
        }

        .goals-result span {
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        .goals {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 8px;
          white-space: nowrap;
        }

        .status {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
        }

        .status.live {
          color: #dc3545;
          text-shadow: 0 0 6px rgba(220, 53, 69, 0.6);
          animation: blink 1s infinite;
        }

        .status.final {
          color: #28a745;
          text-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
        }

        .status.scheduled {
          color: #ffc107;
          text-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Fixture;
