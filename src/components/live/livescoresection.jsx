import React, { useEffect, useState } from 'react';
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

  const { Game, Goals = [], Bookings = [] } = data;

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

  const timelineLogoStyle = {
    width: '65px',
    height: '65px',
    objectFit: 'contain',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    padding: '2px',
    marginBottom: '5px'
  };

  return (
    <div className="section-title single-result" style={{ background: 'url(https://html.iwthemes.com/sportscup/run/img/locations/3.jpg)' }}>
      <div className="container">

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
              <a href="#">{Game.HomeTeamName}</a>
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
                Live on
                <img src="https://html.iwthemes.com/sportscup/run/img/img-theme/espn.gif" alt="espn-logo" />
              </a>
            </div>
          </div>

          <div className="col-md-5 col-lg-5">
            <div className="team right">
              <a href="#">{Game.AwayTeamName}</a>
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

        {/* Timeline */}
        <div className="row">
          <div className="col-lg-12">
            <div className="timeline-result">

              {/* Home Team Timeline */}
              <div className="team-timeline">
                <img src={logos[Game.HomeTeamKey]} alt="club-logo" style={timelineLogoStyle} />
                <a href="single-team.html">{Game.HomeTeamKey}</a>
              </div>

              {/* Timeline Events */}
              <ul className="timeline">
                {[...Goals, ...Bookings]
                  .sort((a, b) => {
                    const minA = a.GameMinute + (a.GameMinuteExtra || 0);
                    const minB = b.GameMinute + (b.GameMinuteExtra || 0);
                    return minA - minB;
                  })
                  .map((event, i) => {
                    const minute = event.GameMinute + (event.GameMinuteExtra || 0);
                    const left = `${Math.min((minute / 120) * 100, 100)}%`;
                    const isHome = event.TeamId === Game.HomeTeamId;
                    const positionClass = isHome ? 'bottom' : 'top';

                    let typeClass = '', title = '';
                    if (event.Type === 'Goal' || event.Type === 'OwnGoal') {
                      typeClass = 'goal';
                      title = 'Goal';
                    } else if (event.Type === 'Yellow Card') {
                      typeClass = 'yellow';
                      title = 'Yellow card';
                    } else if (event.Type === 'Red Card') {
                      typeClass = 'red';
                      title = 'Red card';
                    } else if (event.Type === 'Substitution' || event.Type === 'Substitute') {
                      typeClass = 'change';
                      title = 'Player Change';
                    } else {
                      typeClass = 'change';
                      title = event.Type;
                    }

                    const jersey = event.Jersey ? `${event.Jersey}. ` : '';
                    const name = event.Name || '';
                    const subJersey = event.PlayerOutJersey ? `${event.PlayerOutJersey}. ` : '';
                    const subName = event.PlayerOutName || '';

                    const dataContent = (event.Type === 'Substitution' || event.Type === 'Substitute') && subName
                      ? `${jersey}${name} for ${subJersey}${subName}`
                      : `${jersey}${name}`;

                    return (
                      <li
                        key={i}
                        className={`card-result ${positionClass} ${typeClass}`}
                        style={{ left }}
                        title={title}
                        data-content={dataContent}
                      >
                        {minute}'
                      </li>
                    );
                  })}
              </ul>

              {/* Away Team Timeline */}
              <div className="team-timeline">
                <img src={logos[Game.AwayTeamKey]} alt="club-logo" style={timelineLogoStyle} />
                <a href="single-team.html">{Game.AwayTeamKey}</a>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LiveScoreSection;
