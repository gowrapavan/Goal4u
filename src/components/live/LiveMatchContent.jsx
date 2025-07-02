import React, { useEffect, useState } from 'react';
import Youtube from './Hightlight';
import { useSearchParams } from 'react-router-dom';
import { fetchBoxScoreById } from '../../services/boxscore';
import { getTeamLogoByKey } from '../../services/teamlogo';
import MatchNews from './MatchNews';
import Stream from './stream';
import ModernSpinner from '../common/ModernSpinner';

// ✅ Updated summary generator with paragraph grouping (2–3 paragraphs)
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
    lines.push(`${dominantTeam.name} looked more dangerous in attack with ${dominantTeam.shotsOnGoal} shots on target.`);
  }

  const moreFouls = home.fouls > away.fouls ? home : away;
  if (moreFouls.fouls > 10) {
    lines.push(`${moreFouls.name} committed a high number of fouls (${moreFouls.fouls}), reflecting a physical approach.`);
  }

  const scorers1 = getScorersText(home.id, away.id);
  if (scorers1) lines.push(scorers1);

  const scorers2 = getScorersText(away.id, home.id);
  if (scorers2) lines.push(scorers2);

  lines.push(`Overall, the match showcased contrasting styles, with ${home.name} focusing on ${
    home.passes > away.passes ? 'possession and buildup' : 'defensive play'
  }, while ${away.name} aimed for ${
    away.shots > home.shots ? 'direct attacking chances' : 'control in midfield'
  }.`);

  // Group lines into 2–3 paragraphs
  const paraCount = lines.length > 5 ? 3 : 2;
  const chunkSize = Math.ceil(lines.length / paraCount);
  const paragraphs = [];

  for (let i = 0; i < lines.length; i += chunkSize) {
    paragraphs.push(lines.slice(i, i + chunkSize).join(' '));
  }

  return paragraphs;
};

// 🔽 Rest of the code stays the same as you posted

const LiveMatchContent = ({ activeTab, setActiveTab }) => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const competition = searchParams.get('competition');

  const [matchStats, setMatchStats] = useState(null);
  const [logos, setLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentServer, setCurrentServer] = useState(6);
  const [manualSelection, setManualSelection] = useState(false);

  useEffect(() => {
    const fetchMatchStats = async () => {
      if (!matchId || !competition) return;
      try {
        const stats = await fetchBoxScoreById(competition, Number(matchId));
        setMatchStats(stats);

        const homeLogo = await getTeamLogoByKey(competition, stats.Game.HomeTeamKey);
        const awayLogo = await getTeamLogoByKey(competition, stats.Game.AwayTeamKey);

        setLogos({
          [stats.Game.HomeTeamKey]: homeLogo || `/team-logos/${stats.Game.HomeTeamKey}.png`,
          [stats.Game.AwayTeamKey]: awayLogo || `/team-logos/${stats.Game.AwayTeamKey}.png`,
        });
      } catch (err) {
        console.error('Error fetching match stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchStats();
  }, [matchId, competition]);

  const renderStats = () => {
    if (loading) return <ModernSpinner />;

    const team1 = matchStats?.TeamGames?.[0] || {};
    const team2 = matchStats?.TeamGames?.[1] || {};

    const stats = [
      { label: 'Possession %', key: 'Possession', short: 'Poss' },
      { label: 'Shots On Target', key: 'ShotsOnGoal', short: 'SOT' },
      { label: 'Shots', key: 'Shots', short: 'Sh' },
      { label: 'Passes', key: 'Passes', short: 'Pass' },
      { label: 'Tackles', key: 'Tackles', short: 'Tkl' },
      { label: 'Fouls', key: 'Fouls', short: 'Foul' },
    ];

    return (
      <ul className="match-stats-list list-unstyled mb-4">
        {stats.map(({ label, key, short }, i) => (
          <li key={i} className="d-flex justify-content-between px-3 py-2 border-bottom">
            <span className="text-start w-25 fw-bold">{Math.round(team1[key] ?? 0)}</span>
            <span className="text-center w-50 text-muted">
              <span className="d-none d-sm-inline">{label}</span>
              <span className="d-sm-none">{short}</span>
            </span>
            <span className="text-end w-25 fw-bold">{Math.round(team2[key] ?? 0)}</span>
          </li>
        ))}
      </ul>
    );
  };

  const game = matchStats?.Game;
  const team1 = matchStats?.TeamGames?.[0] || {};
  const team2 = matchStats?.TeamGames?.[1] || {};
  const goals = matchStats?.Goals || [];

  const homeName = game?.HomeTeamName || '';
  const awayName = game?.AwayTeamName || '';
  const homeKey = game?.HomeTeamKey || '';
  const awayKey = game?.AwayTeamKey || '';
  const highlightQuery = homeName && awayName ? `${homeName} vs ${awayName} highlights` : '';
  const newsQuery = homeName && awayName && competition
  ? `${homeName} vs ${awayName} ${competition}` // ⬅ just pass the comp code like "CWC"
  : '';

  const autoSummary = game && team1 && team2 && goals ? generateMatchSummary(team1, team2, game, goals) : '';

  return (
    <section className="content-info">
      <div className="single-team-tabs">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <ul className="nav nav-tabs" id="myTab">
                {['summary', 'stats', 'stream'].map((tab) => (
                  <li className={activeTab === tab ? 'active' : ''} key={tab}>
                    <a href={`#${tab}`} onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}>
                      {tab === 'stats' ? 'Match Stats' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-12">
              <div className="tab-content">
                <div className={`tab-pane ${activeTab === 'stats' ? 'active' : ''}`} id="stats">
                  <div className="row text-center align-items-center mb-3">
                    <div className="col-5 d-flex flex-column align-items-center">
                      {logos?.[homeKey] && (
                        <img src={logos[homeKey]} alt={homeKey} className="img-fluid" style={{ maxHeight: 50 }} />
                      )}
                      <div className="fw-bold mt-1">
                        <span className="d-none d-sm-inline">{homeName}</span>
                        <span className="d-sm-none">{homeKey}</span>
                      </div>
                    </div>

                    <div className="col-2 d-flex justify-content-center align-items-center">
                      <span className="fw-bold">VS</span>
                    </div>

                    <div className="col-5 d-flex flex-column align-items-center">
                      {logos?.[awayKey] && (
                        <img src={logos[awayKey]} alt={awayKey} className="img-fluid" style={{ maxHeight: 50 }} />
                      )}
                      <div className="fw-bold mt-1">
                        <span className="d-none d-sm-inline">{awayName}</span>
                        <span className="d-sm-none">{awayKey}</span>
                      </div>
                    </div>
                  </div>

                  {renderStats()}
                </div>

                <Stream
                  active={activeTab === 'stream'}
                  currentServer={currentServer}
                  setCurrentServer={setCurrentServer}
                  manualSelection={manualSelection}
                  setManualSelection={setManualSelection}
                />

                <div className={`tab-pane ${activeTab === 'summary' ? 'active' : ''}`} id="summary">
                  <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4">
                    <h4 className="text-xl font-semibold text-dark mb-3 border-start border-4 ps-2 border-success">
                      Match Summary & Highlights
                    </h4>
                    <div className="text-muted lh-lg">
                      {(Array.isArray(autoSummary) && autoSummary.length > 0)
                        ? autoSummary.map((p, idx) => <p key={idx} className="mb-3">{p}</p>)
                        : 'Match summary will be available after data is fetched.'}
                    </div>
                  </div>

                  {highlightQuery && <Youtube query={highlightQuery} />}
                  {newsQuery && newsQuery.trim().length > 0 && (
                    <MatchNews matchTitle={newsQuery} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMatchContent;
