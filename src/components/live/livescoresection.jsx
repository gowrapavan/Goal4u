import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBoxScoreById } from '../../services/boxscore';
import { getTeamLogoByKey } from '../../services/teamlogo';

function LiveScoreSection({ setActiveTab, matchData, competition }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logos, setLogos] = useState({});

  useEffect(() => {
    if (!matchData || !competition) return;

    const fetchData = async () => {
      try {
        const res = await fetchBoxScoreById(competition, matchData.Game.GameId);
        setData(res);
        setError(null);

        const homeLogo = await getTeamLogoByKey(competition, res.Game.HomeTeamKey);
        const awayLogo = await getTeamLogoByKey(competition, res.Game.AwayTeamKey);

        setLogos({
          [res.Game.HomeTeamKey]: homeLogo || `/team-logos/${res.Game.HomeTeamKey}.png`,
          [res.Game.AwayTeamKey]: awayLogo || `/team-logos/${res.Game.AwayTeamKey}.png`,
        });
      } catch (err) {
        console.error('Box score fetch error:', err);
        setError('Failed to load match data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchData, competition]);

  if (loading) return <div className="loading-box">Loading match...</div>;
  if (error) return <div className="error-box">{error}</div>;
  if (!data) return null;

  const { Game, Goals = [] } = data;

  const homeTeamId = Game.HomeTeamId;
  const awayTeamId = Game.AwayTeamId;

  const homeScore = Goals.filter(
    g => (g.Type === 'Goal' && g.TeamId === homeTeamId) || (g.Type === 'OwnGoal' && g.TeamId === awayTeamId)
  ).length;

  const awayScore = Goals.filter(
    g => (g.Type === 'Goal' && g.TeamId === awayTeamId) || (g.Type === 'OwnGoal' && g.TeamId === homeTeamId)
  ).length;

  const homeGoals = Goals.filter(
    g => (g.Type === 'Goal' && g.TeamId === homeTeamId) || (g.Type === 'OwnGoal' && g.TeamId === awayTeamId)
  );

  const awayGoals = Goals.filter(
    g => (g.Type === 'Goal' && g.TeamId === awayTeamId) || (g.Type === 'OwnGoal' && g.TeamId === homeTeamId)
  );

  const logoStyle = {
    width: '50px',
    height: '50px',
    objectFit: 'contain',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '5px'
  };

  return (
    <>
      {/* 🔧 CSS Styles */}
      <style>{`
        .back-link {
          position: absolute;
          top: 8px;
          left: 15px;
          color: white;
          font-size: 16px;
          font-weight: 500;
          z-index: 10;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .back-link:hover {
          color: #00ff00; /* green hover */
        }

        @media (min-width: 768px) {
          .back-link {
            top: 15px;
            left: 25px;
            font-size: 18px;
          }
        }

        .team a.team-name {
          font-size: 16px;
          font-weight: 600;
        }
      `}</style>

      <div
        className="section-title single-result"
        style={{
          position: 'relative',
          background: 'url(/assets/img/stadium.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">

          {/* ← Back to Live */}
          <Link to="/live" className="back-link">← Back to Live</Link>

          {/* Match Info */}
          <div className="row">
            <div className="col-lg-12">
              <div className="result-location">
                <ul>
                  <li>{new Date(Game.DateTime).toDateString()}</li>
                  <li><i className="fa fa-map-marker" /> Venue ID: {Game.VenueId}</li>
                  <li>Att: {Game.Attendance?.toLocaleString() || 'N/A'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Score Panel */}
          <div className="row">
            <div className="col-md-5 col-lg-5">
              <div className="team">
                <img src={logos[Game.HomeTeamKey]} alt="home-logo" style={logoStyle} />
                <a href="#" className="team-name">{Game.HomeTeamName}</a>
                <ul>
                  {homeGoals.map((g, i) => (
                    <li key={i}>
                      {g.Name} {g.GameMinute}'{g.Type === 'OwnGoal' && <span> (Own Goal)</span>}
                      <i className="fa fa-futbol-o" style={{ marginLeft: 5 }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-2 col-lg-2">
              <div className="result-match">{homeScore} : {awayScore}</div>
              <div className="live-on">
                <a href="#stream" onClick={(e) => { e.preventDefault(); setActiveTab('stream'); }}>
                  Live on <img src="/assets/img/17x17.png" alt="espn-logo" />
                </a>
              </div>
            </div>

            <div className="col-md-5 col-lg-5">
              <div className="team right">
                <a href="#" className="team-name">{Game.AwayTeamName}</a>
                <img src={logos[Game.AwayTeamKey]} alt="away-logo" style={logoStyle} />
                <ul>
                  {awayGoals.map((g, i) => (
                    <li key={i}>
                      <i className="fa fa-futbol-o" style={{ marginRight: 5 }} />
                      {g.Name} {g.GameMinute}'{g.Type === 'OwnGoal' && <span> (Own Goal)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LiveScoreSection;
