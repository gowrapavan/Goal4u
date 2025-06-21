import React, { useEffect, useRef } from 'react';
import Youtube from './Hightlight';
import Hls from 'hls.js';

const LiveMatchContent = ({ activeTab, setActiveTab }) => {
  const [currentServer, setCurrentServer] = React.useState(6);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const servers = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if (activeTab === 'stream' && videoRef.current) {
      const url = `https://nflarcadia.xyz:443/bRtT37sn3w/Sx5q6YTgCs/${currentServer}.m3u8`;

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = url;
      }
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeTab, currentServer]);

  return (
    <section className="content-info">
      <div className="single-team-tabs">
        <div className="container">
          <div className="row">
            <div className="col-xl-12 col-md-12">
              <ul className="nav nav-tabs" id="myTab">
                <li className={activeTab === 'summary' ? 'active' : ''}>
                  <a href="#summary" onClick={(e) => { e.preventDefault(); setActiveTab('summary'); }}>Summary</a>
                </li>
                <li className={activeTab === 'stats' ? 'active' : ''}>
                  <a href="#stats" onClick={(e) => { e.preventDefault(); setActiveTab('stats'); }}>Mch Stats</a>
                </li>
                <li className={activeTab === 'stream' ? 'active' : ''}>
                  <a href="#stream" onClick={(e) => { e.preventDefault(); setActiveTab('stream'); }}>Stream</a>
                </li>
              </ul>
            </div>

            <div className="col-lg-12">
              <div className="tab-content">
                <div className={`tab-pane ${activeTab === 'summary' ? 'active' : ''}`} id="summary">
                  <div className="panel-box padding-b">
                    <div className="titles"><h4>Match Summary</h4></div>
                    <div className="row">
                      <div className="col-lg-12 col-xl-4">
                        <img src="https://html.iwthemes.com/sportscup/run/img/clubs-teams/single-team.jpg" alt="" />
                      </div>
                      <div className="col-lg-12 col-xl-8">
                        <p>The Colombia national football team (Spanish: Selección de fútbol de Colombia) represents Colombia in international football competitions...</p>
                        <p>Since the mid-1980s, the national team has been a symbol fighting the country's negative reputation...</p>
                        <p>It is a member of the CONMEBOL and is currently ranked thirteenth in the FIFA World Rankings...</p>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12"><h3 className="clear-title">Match News</h3></div>
                    {[1, 2, 3, 4].map((n, i) => (
                      <div className="col-lg-6 col-xl-3" key={i}>
                        <div className="panel-box">
                          <div className="titles no-margin">
                            <h4><a href="#">Sample News Title {n}</a></h4>
                          </div>
                          <a href="#"><img src={`https://html.iwthemes.com/sportscup/run/img/blog/${n}.jpg`} alt="" /></a>
                          <div className="row">
                            <div className="info-panel">
                              <p>Sample description text for blog item {n}.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Youtube />

                  <div className="row no-line-height">
                    <div className="col-md-12"><h3 className="clear-title">Match Sponsors</h3></div>
                  </div>

                  <ul className="sponsors-carousel">
                    {[1, 2, 3, 4, 5, 3].map((n, i) => (
                      <li key={i}><a href="#"><img src={`https://html.iwthemes.com/sportscup/run/img/sponsors/${n}.png`} alt="" /></a></li>
                    ))}
                  </ul>
                </div>

                <div className={`tab-pane ${activeTab === 'stats' ? 'active' : ''}`} id="stats">
                  <div className="row match-stats">
                    <div className="col-lg-5">
                      <div className="team">
                        <img src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/colombia.png" alt="club-logo" />
                        <a href="single-team.html">Colombia</a>
                      </div>
                    </div>
                    <div className="col-lg-2">
                      <div className="result-match">VS</div>
                    </div>
                    <div className="col-lg-5">
                      <div className="team right">
                        <a href="single-team.html">Argentina</a>
                        <img src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/arg.png" alt="club-logo" />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <ul>
                        {["Possession %", "Shots On Target", "Shots", "Touches", "Passes", "Tackles", "Clearances"].map((label, i) => (
                          <li key={i}>
                            <span className="left">58.5</span>
                            <span className="center">{label}</span>
                            <span className="right">40</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`tab-pane ${activeTab === 'stream' ? 'active' : ''}`} id="stream">
                  <div className="panel-box">
                    <div className="titles"><h4>Live Match Stream</h4></div>

                    <div className="text-center mb-3">
                      {servers.map((num) => (
                        <button
                          key={num}
                          onClick={() => setCurrentServer(num)}
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

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMatchContent;
