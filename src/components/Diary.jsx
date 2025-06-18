import React from 'react';
import { useUpcomingMatches } from '../hooks/useApi';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import EmptyState from './common/EmptyState';

const Diary = () => {
  const { data: upcomingMatches, loading, error } = useUpcomingMatches('EPL', 14); // Get matches for next 2 weeks

  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' - ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTeamFlag = (teamName) => {
    // Generate a simple flag placeholder based on team name
    const initial = teamName?.charAt(0) || 'T';
    return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=30&format=svg`;
  };

  const getCompetitionGroup = (competition) => {
    const groups = {
      'EPL': 'PREMIER LEAGUE',
      'SPA': 'LA LIGA',
      'ITA': 'SERIE A',
      'GER': 'BUNDESLIGA',
      'FRA': 'LIGUE 1',
      'UCL': 'CHAMPIONS LEAGUE',
      'UECL': 'EUROPA LEAGUE'
    };
    return groups[competition] || competition || 'FOOTBALL';
  };

  if (loading) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4><i className="fa fa-calendar"></i>Diary</h4>
        </div>
        <LoadingSpinner size="small" message="Loading fixtures..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4><i className="fa fa-calendar"></i>Diary</h4>
        </div>
        <ErrorMessage 
          message={error}
          showConfigHelp={error.includes('not configured')}
        />
      </div>
    );
  }

  if (!upcomingMatches || upcomingMatches.length === 0) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4><i className="fa fa-calendar"></i>Diary</h4>
        </div>
        <EmptyState 
          icon="fa-calendar"
          title="No fixtures"
          description="No upcoming matches scheduled."
        />
      </div>
    );
  }

  // Take first 4 matches for display
  const displayMatches = upcomingMatches.slice(0, 4);

  return (
    <div className="panel-box">
      <div className="titles">
        <h4><i className="fa fa-calendar"></i>Diary</h4>
      </div>

      <ul className="list-diary">
        {displayMatches.map((match, index) => (
          <li key={match.GameId || index}>
            <h6>
              {getCompetitionGroup(match.Competition)}
              <span>{formatMatchDate(match.DateTime)}</span>
            </h6>
            <ul className="club-logo">
              <li>
                <img 
                  src={getTeamFlag(match.HomeTeamName)} 
                  alt={match.HomeTeamName}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${match.HomeTeamName?.charAt(0) || 'H'}&background=007bff&color=fff&size=30`;
                  }}
                />
                <span>{match.HomeTeamName}</span>
              </li>
              <li>
                <img 
                  src={getTeamFlag(match.AwayTeamName)} 
                  alt={match.AwayTeamName}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${match.AwayTeamName?.charAt(0) || 'A'}&background=dc3545&color=fff&size=30`;
                  }}
                />
                <span>{match.AwayTeamName}</span>
              </li>
            </ul>
            {match.VenueType && (
              <div className="match-venue">
                <i className="fa fa-map-marker"></i>
                <span>{match.VenueType}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="text-center mt-3">
        <button className="btn btn-outline-primary btn-sm">
          <i className="fa fa-calendar"></i>
          View Full Fixtures
        </button>
      </div>

      <style jsx>{`
        .list-diary {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .list-diary > li {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .list-diary > li:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .list-diary h6 {
          font-size: 0.8rem;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
          text-transform: uppercase;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .list-diary h6 span {
          font-size: 0.7rem;
          color: #666;
          font-weight: normal;
        }
        
        .club-logo {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .club-logo li {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          padding: 5px;
          background: #f8f9fa;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        
        .club-logo li:hover {
          background: #e9ecef;
        }
        
        .club-logo img {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          margin-right: 10px;
          object-fit: cover;
        }
        
        .club-logo span {
          font-size: 0.85rem;
          font-weight: 500;
          color: #333;
        }
        
        .match-venue {
          margin-top: 8px;
          font-size: 0.75rem;
          color: #666;
          display: flex;
          align-items: center;
        }
        
        .match-venue i {
          margin-right: 5px;
          color: #007bff;
        }
        
        @media (max-width: 768px) {
          .list-diary h6 {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .list-diary h6 span {
            margin-top: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default Diary;