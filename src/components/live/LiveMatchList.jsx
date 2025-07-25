import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { LiveMatch } from '../../services/live-match';
import { getTeamLogoByKey } from '../../services/teamlogo';
import ModernSpinner from '../common/ModernSpinner';

const COMPETITION_NAMES = {
  EPL: 'Premier League',
  ESP: 'La Liga',
  ITA: 'Serie A',
  GER: 'Bundesliga',
  FRA: 'Ligue 1',
  CWC: 'FIFA Club World Cup',
  UCL: 'Champions League',
};

const LiveMatchList = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');

  const getISTDate = (offset = 0) => {
    const now = new Date();
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    ist.setDate(ist.getDate() + offset);
    return ist.toISOString().split('T')[0];
  };

  const dateMap = {
    yesterday: getISTDate(-1),
    today: getISTDate(0),
    tomorrow: getISTDate(1),
  };

  const effectiveDate = selectedDate === 'custom' ? customDate : dateMap[selectedDate];

  const formatMatchDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      timeZone: 'Asia/Kolkata',
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
          `https://ui-avatars.com/api/?name=${encodeURIComponent(homeKey)}&background=6c757d&color=fff&size=30`;
      }

      if (!logos[awayKey]) {
        logos[awayKey] =
          (await getTeamLogoByKey(match.Competition, awayKey)) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(awayKey)}&background=6c757d&color=fff&size=30`;
      }
    }
    setTeamLogos(logos);
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LiveMatch.fetchMatchesByDate(effectiveDate);
      setMatches(data);
      await loadTeamLogos(data);
    } catch (err) {
      setError('Failed to load matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveDate) {
      fetchMatches();
    }
  }, [effectiveDate]);

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

  const filteredMatches = matches.sort((a, b) => {
    if (a.Status === 'InProgress' && b.Status !== 'InProgress') return -1;
    if (a.Status !== 'InProgress' && b.Status === 'InProgress') return 1;
    return new Date(a.DateTime) - new Date(b.DateTime);
  });

  return (
   <div className="live-match-list container" style={{ marginTop: '0.1rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 style={{ color: '#212529' }}>Live & Recent Matches</h3>
        <input
          type="date"
          className="form-control w-auto"
          value={customDate}
          onChange={(e) => {
            setCustomDate(e.target.value);
            setSelectedDate('custom');
          }}
        />
      </div>

      <div className="btn-group mb-3" role="group">
        {['yesterday', 'today', 'tomorrow'].map((label) => (
          <button
            key={label}
            className={`btn btn-sm ${selectedDate === label ? 'btn-primary' : 'btn-outline-secondary'} px-3 py-1 border rounded`}
            onClick={() => {
              setSelectedDate(label);
              setCustomDate('');
            }}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <ModernSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMatches} />
      ) : filteredMatches.length > 0 ? (
        <ul className="match-list list-unstyled">
          {filteredMatches.map((match) => (
            <li
              key={match.GameId}
              className="mb-3 p-2 border rounded text-center"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/livematch?matchId=${match.GameId}&competition=${match.Competition}`)} // ✅ just added this
            >
              {/* Header Row */}
              <div className="match-header d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-medium text-start">
                  {COMPETITION_NAMES[match.Competition] || match.Competition}
                </span>
                <span className="fw-bold match-center-text d-none d-md-inline">
                  {match.HomeTeamKey} vs {match.AwayTeamKey}
                </span>
                <span className="date small text-muted text-end">
                  {formatMatchDate(match.DateTime)}
                </span>
              </div>

              {/* Logos and Score */}
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

              {/* Status */}
              <div className="text-center mt-2">{renderStatusTag(match.Status)}</div>
            </li>
          ))}
        </ul>
      ) : (
          <div className="no-matches-placeholder">
            <div className="animation-container">
              <div className="ball"></div>
            </div>
            <h5 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              No matches found for the selected date ⚽
            </h5>
            <p style={{ color: "#777", fontSize: "0.9rem" }}>
              Please check back later or choose another date.
            </p>
          </div>      )}

      <style jsx>{
       /* 👇 your styles unchanged */ 

      
      
      
      
      /* 👇 your styles unchanged */ `

      .no-matches-placeholder {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  font-family: 'Poppins', sans-serif;
  color: #444;
  animation: fadeIn 0.4s ease-in-out;
  margin-top: 1.5rem;
}

.animation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  margin-bottom: 1rem;
}

.ball {
  width: 60px;
  height: 60px;
  background-image: url('https://cdn-icons-png.flaticon.com/512/861/861512.png');
  background-size: contain;
  background-repeat: no-repeat;
  animation: bounce 1.4s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

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
            .ball {
          width: 160px;
          height: 160px;
          background-image: url('https://cdn-icons-png.flaticon.com/512/861/861512.png');
          background-size: contain;
          background-repeat: no-repeat;
          animation: bounce 1.4s ease-in-out infinite;
        }
          .animation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 164px;
  margin-bottom: 1rem;
}
        }

        .match-center-text {
          flex: 1;
          text-align: center;
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

          .match-center-text {
            display: none;
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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LiveMatchList;
