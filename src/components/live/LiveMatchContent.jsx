import React, { useEffect, useState } from 'react';
import Youtube from './Hightlight';
import { useSearchParams } from 'react-router-dom';
import { fetchBoxScoreById } from '../../services/boxscore';
import { getTeamLogoByKey } from '../../services/teamlogo';
import MatchNews from './MatchNews';
import Stream from './stream'; // ✅ imported new modular Stream

const LiveMatchContent = ({ activeTab, setActiveTab }) => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const competition = searchParams.get('competition');

  const [matchStats, setMatchStats] = useState(null);
  const [logos, setLogos] = useState({});
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
      }
    };

    fetchMatchStats();
  }, [matchId, competition]);

  const renderStats = () => {
    if (!matchStats?.TeamGames || matchStats.TeamGames.length < 2) {
      return <p>Loading stats...</p>;
    }

    const team1 = matchStats.TeamGames[0];
    const team2 = matchStats.TeamGames[1];

    const stats = [
      { label: 'Possession %', home: Math.round(team1.Possession), away: Math.round(team2.Possession) },
      { label: 'Shots On Target', home: Math.round(team1.ShotsOnGoal), away: Math.round(team2.ShotsOnGoal) },
      { label: 'Shots', home: Math.round(team1.Shots), away: Math.round(team2.Shots) },
      { label: 'Passes', home: Math.round(team1.Passes), away: Math.round(team2.Passes) },
      { label: 'Tackles', home: Math.round(team1.Tackles), away: Math.round(team2.Tackles) },
      { label: 'Fouls', home: Math.round(team1.Fouls), away: Math.round(team2.Fouls) },
    ];

    return (
      <ul>
        {stats.map((s, i) => (
          <li key={i}>
            <span className="left">{s.home}</span>
            <span className="center">{s.label}</span>
            <span className="right">{s.away}</span>
          </li>
        ))}
      </ul>
    );
  };

  const game = matchStats?.Game;
  const highlightQuery = game ? `${game.HomeTeamName} vs ${game.AwayTeamName} highlights` : '';

  return (
    <section className="content-info">
      <div className="single-team-tabs">
        <div className="container">
          <div className="row">
            <div className="col-xl-12 col-md-12">
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

            <div className="col-lg-12">
              <div className="tab-content">

                {/* Stats Tab */}
                <div className={`tab-pane ${activeTab === 'stats' ? 'active' : ''}`} id="stats">
                  <div className="row match-stats">
                    <div className="col-lg-5">
                      <div className="team">
                        <img
                          src={logos?.[game?.HomeTeamKey]}
                          alt="home-logo"
                          style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        />
                        <a href="#">{game?.HomeTeamName}</a>
                      </div>
                    </div>
                    <div className="col-lg-2">
                      <div className="result-match">VS</div>
                    </div>
                    <div className="col-lg-5">
                      <div className="team right">
                        <a href="#">{game?.AwayTeamName}</a>
                        <img
                          src={logos?.[game?.AwayTeamKey]}
                          alt="away-logo"
                          style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">{renderStats()}</div>
                  </div>
                </div>

                {/* Stream Tab (modularized) */}
                <Stream
                  active={activeTab === 'stream'}
                  currentServer={currentServer}
                  setCurrentServer={setCurrentServer}
                  manualSelection={manualSelection}
                  setManualSelection={setManualSelection}
                />

                {/* Summary Tab */}
                <div className={`tab-pane ${activeTab === 'summary' ? 'active' : ''}`} id="summary">
                  <div className="panel-box padding-b">
                    <div className="titles"><h4>Match Summary & Highlights</h4></div>
                    <p>Automatically fetched highlights from YouTube.</p>
                  </div>

                  {highlightQuery && <Youtube query={highlightQuery} />}
                  {highlightQuery && <MatchNews matchTitle={highlightQuery} />}
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
