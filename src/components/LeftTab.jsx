import React, { useState } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import RecentMatches from './RecentMatches';
import { useApi } from '../hooks/useApi'; // adjust path
import { sportsAPI } from '../services/api';

const LeftTab = () => {
  const [activeTab, setActiveTab] = useState('statistics');

const { data: recentMatches, loading, error, refetch } = useApi(() => {
  const date = new Date();
  date.setDate(date.getDate() - 3);
  return sportsAPI.getGamesByDate('EPL', date.toISOString().split('T')[0]);
}, []);



  const formatMatchDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Unknown Date';
    }
  };
  
  const getTeamLogo = (teamName, competition) => {
    // Enhanced team logo mapping with fallbacks for top 50 clubs
    const teamLogos = {
      'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
      'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg',
      'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
      'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
      'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
      'Chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
      'Arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
      'Tottenham': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
      'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/240px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
      'Borussia Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/240px-Borussia_Dortmund_logo.svg.png',
      'PSG': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
      'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg/240px-Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg.png',
      'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/240px-Logo_of_AC_Milan.svg.png',
      'Inter Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/240px-FC_Internazionale_Milano_2021.svg.png',
      'Atletico Madrid': 'https://upload.wikimedia.org/wikipedia/en/c/c1/Atletico_Madrid_logo.svg',
      'Ajax': 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
      'Porto': 'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg',
      'Benfica': 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg',
      'Celtic': 'https://upload.wikimedia.org/wikipedia/en/3/35/Celtic_FC.svg',
      'Rangers': 'https://upload.wikimedia.org/wikipedia/en/4/43/Rangers_FC.svg'
    };

    return teamLogos[teamName] || `https://ui-avatars.com/api/?name=${teamName?.charAt(0) || 'T'}&background=007bff&color=fff&size=30`;
  };

  return (
    <div>
      {/* Nav Tabs */}
      <ul className="nav nav-tabs" id="myTab">
        <li className={activeTab === 'statistics' ? 'active' : ''}>
          <a
            href="#statistics"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('statistics');
            }}
          >
            STATISTICS
          </a>
        </li>
        <li className={activeTab === 'groups' ? 'active' : ''}>
          <a
            href="#groups"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('groups');
            }}
          >
            GROUPS
          </a>
        </li>
        <li className={activeTab === 'description' ? 'active' : ''}>
          <a
            href="#description"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('description');
            }}
          >
            DESCRIPTION
          </a>
        </li>
      </ul>

      {/* Content Tabs */}
      <div className="tab-content">
        {/* Tab Statistics */}
        <div
          className={`tab-pane ${activeTab === 'statistics' ? 'active' : ''}`}
          id="statistics"
        >
          <div className="row">
            {/* Club Ranking */}
            <div className="col-lg-4">
              <div className="club-ranking">
                <h5>
                  <a href="group-list.html">Club Ranking (UCL Titles)</a>
                </h5>
                <div className="info-ranking">
                  <ul>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 1 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
                          alt="Real Madrid"
                        />
                        Real Madrid
                      </a>
                      <span className="points"> 15 </span>
                    </li>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 2 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/330px-Logo_of_AC_Milan.svg.png"
                          alt="AC Milan"
                        />
                        AC Milan
                      </a>
                      <span className="points"> 7 </span>
                    </li>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 3 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg/330px-FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg.png"
                          alt="Bayern Munich"
                        />
                        Bayern Munich
                      </a>
                      <span className="points"> 6 </span>
                    </li>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 4 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
                          alt="Liverpool"
                        />
                        Liverpool
                      </a>
                      <span className="points"> 6 </span>
                    </li>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 5 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg"
                          alt="Barcelona"
                        />
                        Barcelona
                      </a>
                      <span className="points"> 5 </span>
                    </li>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 6 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg"
                          alt="Ajax"
                        />
                        Ajax
                      </a>
                      <span className="points"> 4 </span>
                    </li>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 7 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/768px-FC_Internazionale_Milano_2021.svg.png"
                          alt="Inter Milan"
                        />
                        Inter Milan
                      </a>
                      <span className="points"> 3 </span>
                    </li>
                    <li>
                      <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
> 8 </span>
                      <a href="single-team.html">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
                          alt="Manchester United"
                        />
                        Manchester United
                      </a>
                      <span className="points"> 3 </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Results - Top 50 Clubs */}
             <RecentMatches
  recentMatches={recentMatches || []}
  loading={loading}
  error={error}
  refetch={refetch}
  formatMatchDate={formatMatchDate}
  getTeamLogo={getTeamLogo}
/>



            {/* Top Players */}
            <div className="col-lg-4">
                <div className="player-ranking">
                  <h5>
                    <a href="group-list.html">Top Scorers (2024–25)</a>
                  </h5>
                  <div className="info-player">
                    <ul>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>1  </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Picture_with_Mbapp%C3%A9_%28cropped%29.jpg/500px-Picture_with_Mbapp%C3%A9_%28cropped%29.jpg" alt="Kylian Mbappé" />
                          Kylian Mbappé
                        </a>
                        <span className="points">31</span>
                      </li>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>2  </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Mohamed_salah_2018.jpg/640px-Mohamed_salah_2018.jpg" alt="Mohamed Salah" />
                          Mohamed Salah
                        </a>
                        <span className="points">29</span>
                      </li>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>3  </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Robert_Lewandowski_2018_%28cropped%29.jpg/640px-Robert_Lewandowski_2018_%28cropped%29.jpg" alt="Robert Lewandowski" />
                          Robert Lewandowski
                        </a>
                        <span className="points">27</span>
                      </li>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>4  </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Harry_Kane_2023.jpg/640px-Harry_Kane_2023.jpg" alt="Harry Kane" />
                          Harry Kane
                        </a>
                        <span className="points">26</span>
                      </li>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>5   </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/0K8A7975_%2853451429413%29_%28cropped%29.jpg/640px-0K8A7975_%2853451429413%29_%28cropped%29.jpg" alt="Victor Osimhen" />
                          Victor Osimhen
                        </a>
                        <span className="points">26</span>
                      </li>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>6   </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/UEFA_EURO_qualifiers_Sweden_vs_Romaina_20190323_Alexander_Isak_%28cropped%29.jpg/640px-UEFA_EURO_qualifiers_Sweden_vs_Romaina_20190323_Alexander_Isak_%28cropped%29.jpg" alt="Alexander Isak" />
                          Alexander Isak
                        </a>
                        <span className="points">23</span>
                      </li>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>7   </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/ManCity20240722-031_%28cropped%29.jpg/640px-ManCity20240722-031_%28cropped%29.jpg" alt="Erling Haaland" />
                          Erling Haaland
                        </a>
                        <span className="points">22</span>
                      </li>
                      <li>
                        <span
  className="position"
  style={{
    background: 'none',
    color: 'white',
    padding: 0,
    marginRight: '8px', // adds space visually
    display: 'inline-block',
    minWidth: '15px'     // keeps consistent spacing
  }}
>8   </span>
                        <a href="player.html">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Ante-Budimir.png/640px-Ante-Budimir.png" alt="Ante Budimir" />
                          Ante Budimir
                        </a>
                        <span className="points">21</span>
                      </li>

                    </ul>
                  </div>
                </div>
             </div>

          </div>
        </div>

        {/* Tab Groups */}
        <div
          className={`tab-pane ${activeTab === 'groups' ? 'active' : ''}`}
          id="groups"
        >
          <div className="groups-list">
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="groups.html">GROUP A</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/rusia.png"
                          alt=""
                        />
                        Russia
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/arabia.png"
                          alt=""
                        />
                        Saudi Arabia
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/egy.png"
                          alt=""
                        />
                        Egypt
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/uru.png"
                          alt=""
                        />
                        Uruguay
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="groups.html">GROUP B</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/por.png"
                          alt=""
                        />
                        Portugal
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/esp.png"
                          alt=""
                        />
                        Spain
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/mar.png"
                          alt=""
                        />
                        Morocco
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/irn.png"
                          alt=""
                        />
                        IR Iran
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="group-list.html">GROUP C</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/fra.png"
                          alt=""
                        />
                        France
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/aus.png"
                          alt=""
                        />
                        Australia
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/per.png"
                          alt=""
                        />
                        Peru
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/den.png"
                          alt=""
                        />
                        Denmark
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="group-list.html">GROUP D</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/arg.png"
                          alt=""
                        />
                        Argentina
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/isl.png"
                          alt=""
                        />
                        Iceland
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/cro.png"
                          alt=""
                        />
                        Croatia
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/nga.png"
                          alt=""
                        />
                        Nigeria
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="group-list.html">GROUP E</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/bra.png"
                          alt=""
                        />
                        Brazil
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/sui.png"
                          alt=""
                        />
                        Switzerland
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/costa-rica.png"
                          alt=""
                        />
                        Costa Rica
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/srb.png"
                          alt=""
                        />
                        Serbia
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="group-list.html">GROUP F</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/ger.png"
                          alt=""
                        />
                        Germany
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/mex.png"
                          alt=""
                        />
                        Mexico
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/swe.png"
                          alt=""
                        />
                        Sweden
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/kor.png"
                          alt=""
                        />
                        Korea Rep
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="group-list.html">GROUP G</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/bel.png"
                          alt=""
                        />
                        Belgium
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/pan.png"
                          alt=""
                        />
                        Panama
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/tun.png"
                          alt=""
                        />
                        Tunisia
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/eng.png"
                          alt=""
                        />
                        England
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <h5>
                  <a href="group-list.html">GROUP H</a>
                </h5>
                <div className="item-group">
                  <ul>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/pol.png"
                          alt=""
                        />
                        Poland
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/sen.png"
                          alt=""
                        />
                        Senegal
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/colombia.png"
                          alt=""
                        />
                        Colombia
                      </a>
                    </li>
                    <li>
                      <a href="single-team.html">
                        <img
                          src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/japan.png"
                          alt=""
                        />
                        Japan
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Description */}
        <div
          className={`tab-pane ${activeTab === 'description' ? 'active' : ''}`}
          id="description"
        >
          <div className="info-general">
            <div className="row">
              <div className="col-md-4">
                <img
                  src="https://html.iwthemes.com/sportscup/run/img/locations/1.jpg"
                  alt=""
                />
              </div>
              <div className="col-md-8">
                <h3>2018 FIFA World Cup</h3>
                <p className="lead">
                  The 2018 FIFA World Cup will be the 21st FIFA World Cup, a
                  quadrennial international football tournament contested by the
                  men's national teams. West of the Ural Mountains to keep
                  travel time manageable.
                </p>
              </div>
              <div className="col-md-12">
                <p>
                  It is scheduled to take place in Russia from 14 June to 15
                  July 2018,[2] after the country was awarded the hosting rights
                  on 2 December 2010. This will be the first World Cup held in
                  Europe since 2006; all but one of the stadium venues are in
                  European Russia, west of the Ural Mountains to keep travel
                  time manageable.
                </p>
                <h4>Gianni Infantino - Fifa President</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftTab;