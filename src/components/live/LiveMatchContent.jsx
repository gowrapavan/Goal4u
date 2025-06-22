import React, { useEffect, useRef, useState } from 'react';
import Youtube from './Hightlight'; // assumes you updated this component to accept `query` prop
import Hls from 'hls.js';
import { useSearchParams } from 'react-router-dom';
import { fetchBoxScoreById } from '../../services/boxscore';
import { getTeamLogoByKey } from '../../services/teamlogo';
import MatchNews from './MatchNews'; // adjust path if needed


const LiveMatchContent = ({ activeTab, setActiveTab }) => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const competition = searchParams.get('competition');

  const [matchStats, setMatchStats] = useState(null);
  const [logos, setLogos] = useState({});
  const [currentServer, setCurrentServer] = useState(6);
  const [manualSelection, setManualSelection] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const hlsRef = useRef(null);
  const servers = [1, 2, 3, 4, 5, 6];

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

  const showInlineAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const loadStream = (serverId, fallback = false, index = 0) => {
    const video = videoRef.current;
    const url = `https://nflarcadia.xyz:443/bRtT37sn3w/Sx5q6YTgCs/${serverId}.m3u8`;

    if (!video) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      const onLoaded = () => {
        const duration = video.duration;
        video.removeEventListener('loadedmetadata', onLoaded);

        if (duration && duration <= 11) {
          if (fallback) {
            showInlineAlert(`Server ${serverId} is offline. Trying next...`);
            const nextIndex = (index + 1) % servers.length;
            setTimeout(() => loadStream(servers[nextIndex], true, nextIndex), 2000);
          }
        } else {
          setCurrentServer(serverId);
        }
      };

      video.addEventListener('loadedmetadata', onLoaded);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal && fallback) {
          showInlineAlert(`HLS error on Server ${serverId}. Trying next...`);
          hls.destroy();
          const nextIndex = (index + 1) % servers.length;
          setTimeout(() => loadStream(servers[nextIndex], true, nextIndex), 2000);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  };

  useEffect(() => {
    if (activeTab !== 'stream' || !videoRef.current) return;
    streamRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (!manualSelection) {
      const index = servers.indexOf(currentServer);
      loadStream(currentServer, true, index);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeTab]);

  const handleServerClick = (serverId, index) => {
    setManualSelection(true);
    loadStream(serverId, true, index);
  };

  const renderStats = () => {
    if (!matchStats || !matchStats.TeamGames || matchStats.TeamGames.length < 2) {
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

                {/* Match Stats */}
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

                {/* Stream */}
                <div className={`tab-pane ${activeTab === 'stream' ? 'active' : ''}`} id="stream" ref={streamRef}>
                  <div className="panel-box">
                    <div className="titles">
                      <h4>Live Match Stream</h4>
                      {alertMessage && (
                        <div style={{ backgroundColor: '#ffe9e9', color: '#c0392b', padding: '10px', borderRadius: '5px' }}>
                          {alertMessage}
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-3">
                      {servers.map((num, i) => (
                        <button
                          key={num}
                          onClick={() => handleServerClick(num, i)}
                          style={{
                            margin: '4px',
                            padding: '6px 14px',
                            background: currentServer === num ? '#33FFC9' : '#eee',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          Server {num}
                        </button>
                      ))}
                    </div>

                    <div className="row">
                      <div className="col-lg-12">
                        <video
                          ref={videoRef}
                          controls
                          autoPlay
                          muted
                          style={{ width: '100%', maxHeight: '500px', backgroundColor: '#000', borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
<div className={`tab-pane ${activeTab === 'summary' ? 'active' : ''}`} id="summary">
  <div className="panel-box padding-b">
    <div className="titles"><h4>Match Summary & Highlights</h4></div>
    <p>Automatically fetched highlights from YouTube.</p>
  </div>

  {highlightQuery && <Youtube query={highlightQuery} />}

  {/* 🔥 Add dynamic news here */}
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
