import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Youtube from './Hightlight';
import { getTeamLogoByKey } from '../../services/teamlogo';
import MatchNews from './MatchNews';
import Stream from './stream';
import ModernSpinner from '../common/ModernSpinner';

// ✅ Match summary generator
const generateMatchSummary = (team1, team2, game, goals) => {
  const home = {
    name: game?.HomeTeamName,
    key: game?.HomeTeamKey,
    id: game?.HomeTeamId,
    poss: team1.Possession ?? 0,
    shots: team1.Shots ?? 0,
    shotsOnGoal: team1.ShotsOnGoal ?? 0,
    passes: team1.Passes ?? 0,
    tackles: team1.Tackles ?? 0,
    fouls: team1.Fouls ?? 0,
  };

  const away = {
    name: game?.AwayTeamName,
    key: game?.AwayTeamKey,
    id: game?.AwayTeamId,
    poss: team2.Possession ?? 0,
    shots: team2.Shots ?? 0,
    shotsOnGoal: team2.ShotsOnGoal ?? 0,
    passes: team2.Passes ?? 0,
    tackles: team2.Tackles ?? 0,
    fouls: team2.Fouls ?? 0,
  };

  const getScorersText = (teamId, opponentId) => {
    const teamGoals = goals.filter(
      g =>
        (g.Type === 'Goal' && g.TeamId === teamId) ||
        (g.Type === 'OwnGoal' && g.TeamId === opponentId)
    );
    if (!teamGoals.length) return '';
    const scorers = teamGoals.map(g => {
      const ownGoal = g.Type === 'OwnGoal' ? ' (Own Goal)' : '';
      return `${g.Name} (${g.GameMinute}’${ownGoal})`;
    });
    const teamName = teamId === home.id ? home.name : away.name;
    return `Goals for ${teamName} came from ${scorers.join(', ')}.`;
  };

  const lines = [];
  lines.push(`${home.name} and ${away.name} faced off in a closely contested match.`);
  if (Math.abs(home.poss - away.poss) > 10) {
    const leader = home.poss > away.poss ? home : away;
    lines.push(`${leader.name} controlled the game with ${leader.poss}% possession.`);
  }
  const dominantTeam =
    home.shotsOnGoal > away.shotsOnGoal
      ? home
      : away.shotsOnGoal > home.shotsOnGoal
      ? away
      : null;
  if (dominantTeam) {
    lines.push(
      `${dominantTeam.name} looked more dangerous in attack with ${dominantTeam.shotsOnGoal} shots on target.`
    );
  }
  const moreFouls = home.fouls > away.fouls ? home : away;
  if (moreFouls.fouls > 10) {
    lines.push(
      `${moreFouls.name} committed a high number of fouls (${moreFouls.fouls}), reflecting a physical approach.`
    );
  }
  const scorers1 = getScorersText(home.id, away.id);
  if (scorers1) lines.push(scorers1);
  const scorers2 = getScorersText(away.id, home.id);
  if (scorers2) lines.push(scorers2);
  lines.push(
    `Overall, the match showcased contrasting styles, with ${
      home.name
    } focusing on ${
      home.passes > away.passes ? 'possession and buildup' : 'defensive play'
    }, while ${away.name} aimed for ${
      away.shots > home.shots ? 'direct attacking chances' : 'control in midfield'
    }.`
  );

  const paraCount = lines.length > 5 ? 3 : 2;
  const chunkSize = Math.ceil(lines.length / paraCount);
  const paragraphs = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    paragraphs.push(lines.slice(i, i + chunkSize).join(' '));
  }
  return paragraphs;
};

const LiveContent = ({ activeTab, setActiveTab, matchData, competition }) => {
  const [logos, setLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentServer, setCurrentServer] = useState(6);
  const [manualSelection, setManualSelection] = useState(false);

  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');

  useEffect(() => {
    const fetchLogos = async () => {
      if (!matchData || !competition) return;
      try {
        const homeLogo = await getTeamLogoByKey(competition, matchData.Game.HomeTeamKey);
        const awayLogo = await getTeamLogoByKey(competition, matchData.Game.AwayTeamKey);
        setLogos({
          [matchData.Game.HomeTeamKey]:
            homeLogo || `/team-logos/${matchData.Game.HomeTeamKey}.png`,
          [matchData.Game.AwayTeamKey]:
            awayLogo || `/team-logos/${matchData.Game.AwayTeamKey}.png`,
        });
      } catch (err) {
        console.error('Error fetching logos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogos();
  }, [matchData, competition]);

  if (!matchData) return null;
  const { Game, TeamGames = [], Goals = [] } = matchData;
  const team1 = TeamGames[0] || {};
  const team2 = TeamGames[1] || {};

  const homeName = Game?.HomeTeamName || '';
  const awayName = Game?.AwayTeamName || '';
  const homeKey = Game?.HomeTeamKey || '';
  const awayKey = Game?.AwayTeamKey || '';
  const highlightQuery = homeName && awayName ? `${homeName} vs ${awayName} highlights` : '';
  const newsQuery =
    homeName && awayName && competition ? `${homeName} vs ${awayName} ${competition}` : '';

  const autoSummary =
    Game && team1 && team2 && Goals ? generateMatchSummary(team1, team2, Game, Goals) : '';

  const homeGoals = Goals.filter(
    g =>
      (g.Type === 'Goal' && g.TeamId === Game.HomeTeamId) ||
      (g.Type === 'OwnGoal' && g.TeamId === Game.AwayTeamId)
  );
  const awayGoals = Goals.filter(
    g =>
      (g.Type === 'Goal' && g.TeamId === Game.AwayTeamId) ||
      (g.Type === 'OwnGoal' && g.TeamId === Game.HomeTeamId)
  );

  const homeScore = homeGoals.length;
  const awayScore = awayGoals.length;

  const renderStats = () => {
    if (loading) return <ModernSpinner />;
    const stats = [
      { label: 'Possession %', key: 'Possession', short: 'Poss' },
      { label: 'Shots On Target', key: 'ShotsOnGoal', short: 'SOT' },
      { label: 'Shots', key: 'Shots', short: 'Sh' },
      { label: 'Passes', key: 'Passes', short: 'Pass' },
      { label: 'Tackles', key: 'Tackles', short: 'Tkl' },
      { label: 'Fouls', key: 'Fouls', short: 'Foul' },
    ];
    return (
      <ul className="lc-stats-list">
        {stats.map(({ label, key, short }, i) => (
          <li key={i} className="lc-stats-item">
            <span className="lc-stats-home">{Math.round(team1[key] ?? 0)}</span>
            <span className="lc-stats-label">
              <span className="lc-label-full">{label}</span>
              <span className="lc-label-short">{short}</span>
            </span>
            <span className="lc-stats-away">{Math.round(team2[key] ?? 0)}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {/* 🔼 Top Score Section */}
      <div className="lc-top-section">
        <div className="lc-container">
          <Link to="/live" className="lc-back-link">← Back to Live</Link>
          <div className="lc-meta">
            <ul>
              <li>{new Date(Game.DateTime).toDateString()}</li>
              <li>Venue ID: {Game.VenueId}</li>
              <li>Att: {Game.Attendance?.toLocaleString() || 'N/A'}</li>
            </ul>
          </div>
          <div className="lc-score-panel">
            <div className="lc-team lc-home">
              <img src={logos[homeKey]} alt="home-logo" className="lc-team-logo" />
              <span className="lc-team-name">{homeName}</span>
              <ul className="lc-goal-list">
                {homeGoals.map((g, i) => (
                  <li key={i}>{g.Name} {g.GameMinute}'{g.Type === 'OwnGoal' && <span> (Own Goal)</span>}</li>
                ))}
              </ul>
            </div>
            <div className="lc-score">
              {homeScore} : {awayScore}
              <div className="lc-live-link">
                <a href="#stream" onClick={e => { e.preventDefault(); setActiveTab('stream'); }}>
                  Live on <img src="/assets/img/17x17.png" alt="espn-logo" />
                </a>
              </div>
            </div>
            <div className="lc-team lc-away">
              <img src={logos[awayKey]} alt="away-logo" className="lc-team-logo" />
                            <span className="lc-team-name">{awayName}</span>

              <ul className="lc-goal-list">
                {awayGoals.map((g, i) => (
                  <li key={i}>{g.Name} {g.GameMinute}'{g.Type === 'OwnGoal' && <span> (Own Goal)</span>}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 🔽 Tabs Section */}
      <section className="lc-tabs-section">
        <div className="lc-container">
          <ul className="lc-tabs">
            {['summary', 'stats', 'stream'].map(tab => (
              <li key={tab} className={`lc-tab-item ${activeTab === tab ? 'lc-active' : ''}`}>
                <a href={`#${tab}`} onClick={e => { e.preventDefault(); setActiveTab(tab); }}>
                  {tab === 'stats' ? 'Match Stats' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </a>
              </li>
            ))}
          </ul>
          <div className="lc-tab-content">
            {activeTab === 'stats' && <div className="lc-tab-panel">{renderStats()}</div>}
            {activeTab === 'stream' && (
              <Stream
                active
                currentServer={currentServer}
                setCurrentServer={setCurrentServer}
                manualSelection={manualSelection}
                setManualSelection={setManualSelection}
              />
            )}
            {activeTab === 'summary' && (
              <div className="lc-tab-panel">
                <div className="lc-summary-card">
                  <h4 className="lc-summary-title">Match Summary & Highlights</h4>
                  <div className="lc-summary-body">
                    {Array.isArray(autoSummary) && autoSummary.length > 0
                      ? autoSummary.map((p, idx) => <p key={idx} className="lc-summary-text">{p}</p>)
                      : 'Match summary will be available after data is fetched.'}
                  </div>
                </div>
                {highlightQuery && <Youtube query={highlightQuery} />}
                {newsQuery && newsQuery.trim().length > 0 && <MatchNews matchTitle={newsQuery} />}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🎨 Updated Inline Styles */}
<style>{`
  .lc-container { 
    max-width: 1200px; 
    margin: auto; 
    padding: 1rem; 
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* 🔼 Top Section */
  .lc-top-section {
    background: linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)),
                url(/assets/img/stadium.jpg) center/cover no-repeat;
    color: white;
    padding: 2.5rem 1rem;
    border-bottom: 3px solid #28a745;
    border-radius: 10px;
  }

  .lc-back-link { 
    color: #28a745; 
    text-decoration: none; 
    font-weight: bold; 
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  .lc-meta {
    font-size: 0.9rem;
    opacity: 0.85;
    margin-bottom: 1rem;
  }
  .lc-meta ul { 
    display: flex; 
    gap: 1.5rem; 
    list-style: none; 
    padding: 0; 
    margin: 0; 
    flex-wrap: wrap; 
    justify-content: center;
  }

  .lc-score-panel {
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start;
    background: rgba(20,20,20,0.95); 
    padding: 1.5rem; 
    box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    gap: 1rem;
    flex-wrap: wrap;
  }

  .lc-team { flex: 1 1 200px; text-align: center; color: #f1f1f1; }
  .lc-team-logo { width: 60px; height: 60px; margin: 0.5rem auto; display: block; border-radius: 50%; }
  .lc-team-name { font-weight: bold; display: block; margin-bottom: 0.5rem; font-size: 1.1rem; }
  .lc-goal-list { list-style: none; padding: 0; margin: 0; font-size: 0.85rem; line-height: 1.5; }

  .lc-score { font-size: 2.5rem; font-weight: bold; text-align: center; color: #28a745; flex: 0.5; }
  .lc-live-link { margin-top: 0.5rem; font-size: 0.9rem; text-align: center; }
  .lc-live-link img { vertical-align: middle; margin-left: 0.25rem; }

  /* 🔽 Tabs Section */
  .lc-tabs-section { background: #121212; padding: 1rem 1rem; border-radius: 10px; }
  .lc-tabs {
    display: flex; gap: 1.5rem; border-bottom: 2px solid #28a745;
    list-style: none; padding: 0; margin: 0 0 1.5rem;
    justify-content: center; overflow-x: auto;
  }
  .lc-tabs li { white-space: nowrap; }
  .lc-tab-item a { text-decoration: none; color: #bbb; padding: 0.75rem 1.5rem; display: block; transition: 0.3s; }
  .lc-tab-item.lc-active a { border-bottom: 3px solid #28a745; color: #28a745; font-weight: bold; }
  .lc-tab-item a:hover { color: #28a745; }

  .lc-tab-content {
    background: #1e1e1e; border-radius: 10px; padding: 2rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    min-height: 200px;
  }

  /* Stats */
  .lc-stats-list { list-style: none; padding: 0; margin: 0; }
  .lc-stats-item { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #333; color: #ddd; align-items: center; }
  .lc-stats-home, .lc-stats-away { font-weight: bold; width: 20%; text-align: center; color: #28a745; }
  .lc-stats-label { flex: 1; text-align: center; color: #aaa; }
  .lc-label-full { display: inline-block; }
  .lc-label-short { display: none; }

  /* Match Summary */
  .lc-summary-card { background: #222; padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem; border-left: 4px solid #28a745; }
  .lc-summary-title { font-size: 1.25rem; margin-bottom: 1rem; color: #28a745; }
  .lc-summary-text { margin-bottom: 1rem; line-height: 1.6; color: #ccc; }

  /* 🎥 Youtube & News spacing */
  .lc-tab-panel > * + * { margin-top: 1.5rem; }

  /* 📱 Responsive */
  @media (max-width: 992px) {
    .lc-score { font-size: 2rem; }
    .lc-team-logo { width: 50px; height: 50px; }
  }

@media (max-width: 768px) {
 .lc-top-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lc-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .lc-score-panel { 
    flex-direction: row !important; /* keep horizontal */
    align-items: center; 
    justify-content: space-between;
    flex-wrap: nowrap; /* prevent wrapping */
    padding: 1rem;
    order: 1; /* keep on top */
  }
  .lc-team { 
    flex: 1 1 40%; /* enough width for team + logo */
    margin-bottom: 0;
    text-align: center; 
  }
  .lc-score { 
    font-size: 2rem; /* keep readable */
    flex: 0 0 auto; /* prevent shrinking */
    margin: 0 1rem; /* spacing around score */
  }
     .lc-meta {
    order: 2; /* push meta below score panel */
    text-align: center;
  }
  .lc-tabs { justify-content: flex-start; gap: 1rem; }

}


  @media (max-width: 480px) {
    .lc-score { font-size: 1.8rem; }
    .lc-team-logo { width: 40px; height: 40px; }
    .lc-team-name { font-size: 0.9rem; }
    .lc-summary-title { font-size: 1rem; }
    .lc-tab-content { padding: 0.1rem; }
    .lc-label-full { display: none; }
    .lc-label-short { display: inline-block; }
  }
`}</style>


    </>
  );
};

export default LiveContent;
