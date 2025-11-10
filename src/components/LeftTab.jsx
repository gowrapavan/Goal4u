import React, { useState, useEffect } from 'react';
import RecentMatches from './RecentMatches'; // Ensure this is also static or mock data
import TopScorers from "./TopScorers";

// --- Base URL and League Definitions ---
const BASE_LEAGUE_URL = "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/standing/";
const LEAGUE_SOURCES = [
  { key: 'ESP', label: 'La Liga', file: 'ESP.json' },
  { key: 'EPL', label: 'Premier League', file: 'EPL.json' },
  { key: 'DEB', label: 'Bundesliga', file: 'DEB.json' },
  { key: 'ITSA', label: 'Serie A', file: 'ITSA.json' },
  { key: 'FRL1', label: 'Ligue 1', file: 'FRL1.json' }
];

const LeftTab = () => {
  const [activeTab, setActiveTab] = useState('statistics');

  // --- State for Table Tab ---
  const [selectedLeague, setSelectedLeague] = useState('ESP'); // Default to La Liga
  const [tableData, setTableData] = useState([]);
  const [topClub, setTopClub] = useState(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [errorTable, setErrorTable] = useState(null);
  
  // --- NEW State for extra details ---
  const [competitionName, setCompetitionName] = useState('La Liga');
  const [competitionEmblem, setCompetitionEmblem] = useState(''); 
  const [countryFlag, setCountryFlag] = useState('');
  const [countryName, setCountryName] = useState('');
  const [currentMatchday, setCurrentMatchday] = useState(null);


  // --- Data Fetching for Table (runs when selectedLeague changes) ---
  useEffect(() => {
    const fetchTableData = async (leagueKey) => {
      setLoadingTable(true);
      setErrorTable(null);
      setTableData([]); // Clear old data
      setTopClub(null); // Clear old top club
      setCompetitionEmblem(''); // Clear old emblem
      setCountryFlag(''); // Clear old flag
      setCountryName(''); // Clear old country
      setCurrentMatchday(null); // Clear old matchday

      const league = LEAGUE_SOURCES.find(l => l.key === leagueKey);
      if (!league) {
        setErrorTable("Invalid league selected");
        setLoadingTable(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_LEAGUE_URL}${league.file}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${league.label} data`);
        }
        const data = await response.json();
        
        const standings = data.standings[0]?.table;
        
        if (standings && standings.length > 0) {
          // --- SET ALL NEW DATA ---
          setCompetitionName(data.competition.name);
          setCompetitionEmblem(data.competition.emblem);
          setCountryFlag(data.area.flag);
          setCountryName(data.area.name);
          setCurrentMatchday(data.season.currentMatchday);
          
          // --- GET TOP 3 ONLY ---
          const top3standings = standings.slice(0, 3);
          setTableData(top3standings);
          setTopClub(standings[0]); // Top club is still the first in the array
        } else {
          throw new Error('No table data found in JSON');
        }
      } catch (err) {
        setErrorTable(err.message);
      } finally {
        setLoadingTable(false);
      }
    };
    
    fetchTableData(selectedLeague);
  }, [selectedLeague]); // Re-runs when selectedLeague changes

  // --- Original Functions ---
  const recentMatches = [];
  const loading = false;
  const error = null;

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

  const getTeamLogo = (teamName) => {
    const teamLogos = {
      'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
      'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/330px-Logo_of_AC_Milan.svg.png',
      'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg/330px-FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg.png',
      'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
      'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg',
      'Ajax': 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
      'Inter Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/768px-FC_Internazionale_Milano_2021.svg.png',
      'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg'
    };
    return teamLogos[teamName] || `https://ui-avatars.com/api/?name=${teamName?.charAt(0) || 'T'}&background=007bff&color=fff&size=30`;
  };

  return (
    // --- Wrapper div with a unique ID ---
    <div id="left-tab-scoped"> 
      {/* --- Prefixed all rules with #left-tab-scoped --- */}
      <style>{`
        /* Fix for scrollbar on TABS */
        #left-tab-scoped .nav-tabs#myTab {
          overflow: visible !important;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        #left-tab-scoped .nav-tabs#myTab::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }

        /* Fix for scrollbar on CLUB RANKING */
        #left-tab-scoped .club-ranking .info-ranking {
          max-height: none !important;
          overflow-y: visible !important;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        #left-tab-scoped .club-ranking .info-ranking::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }

        /* --- Styles for Main Tabs (Statistics, Table, Description) --- */
        #left-tab-scoped .nav-tabs#myTab {
            border-bottom: 1px solid #3a3a3a !important; 
            margin-bottom: 20px; 
            display: flex; /* Added for wrapping */
        }
        #left-tab-scoped .nav-tabs#myTab > li > a {
            color: #ffffff; 
            background-color: transparent !important; 
            border: none !important; 
            border-bottom: 3px solid transparent !important; 
            padding: 15px 12px;
            font-weight: 600;
            transition: all 0.2s ease;
            text-transform: uppercase;
        }
        #left-tab-scoped .nav-tabs#myTab > li > a:hover {
            color: #12dba1; 
            border-bottom: 3px solid #12dba1 !important; 
            background-color: transparent !important;
        }
        #left-tab-scoped .nav-tabs#myTab > li.active > a,
        #left-tab-scoped .nav-tabs#myTab > li.active > a:hover,
        #left-tab-scoped .nav-tabs#myTab > li.active > a:focus {
            color: #12dba1 !important; 
            background-color: transparent !important;
            border: none !important;
            border-bottom: 3px solid #12dba1 !important; 
        }

        
        /* --- Styles for NEW TABLE Tab --- */

        /* --- Styles for League Selector Buttons --- */
        #left-tab-scoped .ltab-league-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        #left-tab-scoped .ltab-league-btn {
          background: #333; 
          border: 1px solid #444; 
          color: #9e9e9e;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        #left-tab-scoped .ltab-league-btn:hover {
          background: #444;
          color: #fff;
        }
        #left-tab-scoped .ltab-league-btn.active {
          background: #12dba1; /* Active green */
          color: #fff;
          border-color: #12dba1;
        }

        /* --- NEW Top Club Highlight Card --- */
        #left-tab-scoped .ltab-top-club {
          background: #2a2a2a; 
          padding: 20px;
          margin-bottom: 1px; 
          border: 1px solid #3a3a3a; 
          border-bottom: none; 
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Left Column (League Info) */
        #left-tab-scoped .ltab-top-league-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px; /* Increased gap */
        }
        /* --- FIX: Increased League Logo size --- */
        #left-tab-scoped .ltab-top-league-info .ltab-league-logo {
          height: 35px; /* Increased logo size */
          width: auto;
        }
        #left-tab-scoped .ltab-top-league-info h5 {
          color: #aaaaaa; 
          font-size: 14px;
          margin: 0;
          text-transform: uppercase;
        }
        /* --- NEW: League details (flag, country, matchday) --- */
        #left-tab-scoped .ltab-league-details {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 12px; /* Row and column gap */
          font-size: 13px;
          color: #888;
        }
        #left-tab-scoped .ltab-league-details .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        #left-tab-scoped .ltab-league-details img {
          height: 16px;
          width: auto;
        }


        /* Right Column (Club Info) */
        #left-tab-scoped .ltab-top-club-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        /* --- FIX: Adjusted logo size --- */
        #left-tab-scoped .ltab-top-club-details img {
          width: 50px; /* Adjusted size */
          height: 50px; /* Adjusted size */
          object-fit: contain;
        }
        #left-tab-scoped .ltab-top-club-details .club-name {
          font-size: 18px;
          font-weight: bold;
          color: #fff;
          margin: 0;
        }
        #left-tab-scoped .ltab-top-club-details .club-stats {
          font-size: 13px;
          color: #aaaaaa; 
        }

        /* --- START: CSS Grid Table Replacement --- */
        #left-tab-scoped .ltab-grid-wrapper {
          overflow-x: auto; 
          border: 1px solid #3a3a3a; 
          border-top: none; 
          background: #2a2a2a; 
        }
        
        #left-tab-scoped .ltab-grid-table {
          display: grid;
          /* Desktop Columns */
          grid-template-columns: 40px minmax(150px, 1fr) repeat(7, 45px) 50px;
          min-width: 600px; 
        }
        
        /* Header Row Styles */
        #left-tab-scoped .ltab-grid-header {
          display: contents; 
        }
        
        #left-tab-scoped .ltab-grid-header > div {
          background-color: #1e1e1e; 
          color: #aaaaaa; 
          font-weight: 500; 
          font-size: 12px;
          text-transform: uppercase;
          padding: 12px;
          border-bottom: 1px solid #3a3a3a;
          white-space: nowrap;
        }
        
        /* Body Row Styles */
        #left-tab-scoped .ltab-grid-row {
          display: contents; 
        }

        #left-tab-scoped .ltab-grid-row:hover > div {
           background-color: #3a3a3a; 
        }

        /* All Body Cell Styles */
        #left-tab-scoped .ltab-grid-row > div {
          padding: 12px;
          border-bottom: 1px solid #3a3a3a;
          white-space: nowrap;
          font-size: 14px;
          color: #aaaaaa; 
          display: flex; 
          align-items: center;
          transition: background-color 0.2s ease;
        }

        /* Remove bottom border from last row */
        #left-tab-scoped .ltab-grid-row:last-child > div {
          border-bottom: none;
        }

        /* Team Cell (Club Name) */
        #left-tab-scoped .ltab-grid-row .team-cell {
          color: #ffffff; 
          font-weight: normal; 
        }
        
        #left-tab-scoped .ltab-grid-row .team-cell img {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          object-fit: contain;
        }

        /* --- FIX: Responsive Team Names --- */
        #left-tab-scoped .team-name-mobile { display: none; }
        #left-tab-scoped .team-name-desktop { display: inline; }
        
        /* Column-specific alignments */
        #left-tab-scoped .ltab-grid-table .pos {
          text-align: left;
          justify-content: flex-start; 
        }
        
        #left-tab-scoped .ltab-grid-table .mp,
        #left-tab-scoped .ltab-grid-table .w,
        #left-tab-scoped .ltab-grid-table .d,
        #left-tab-scoped .ltab-grid-table .l,
        #left-tab-scoped .ltab-grid-table .gf,
        #left-tab-scoped .ltab-grid-table .ga,
        #left-tab-scoped .ltab-grid-table .gd,
        #left-tab-scoped .ltab-grid-table .pts {
           text-align: center;
           justify-content: center; 
           font-size: 13px;
        }

        #left-tab-scoped .ltab-grid-row .pts {
            font-weight: bold;
            color: #ffffff;
        }
        
        /* --- END: CSS Grid Table Replacement --- */
        
        #left-tab-scoped .ltab-loading-error-msg {
          color: #9e9e9e;
          padding: 20px;
          text-align: center;
        }
        
        /* --- Styles for DESCRIPTION Tab --- */
        #left-tab-scoped .ltab-tournament-description {
          background: #2b2b2b;
          padding: 20px;
          color: #f0f0f0;
        }
        #left-tab-scoped .ltab-tournament-description h5 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 15px;
        }
        #left-tab-scoped .ltab-tournament-description p {
          color: #9e9e9e;
          line-height: 1.6;
          margin-bottom: 15px;
          font-size: 14px;
        }

        /* --- START: Mobile Responsive Styles --- */
        @media (max-width: 767px) {
          /* Make main tabs wrap */
          #left-tab-scoped .nav-tabs#myTab {
            flex-wrap: wrap;
          }

          /* Stack top club card */
          #left-tab-scoped .ltab-top-club {
            flex-direction: column;
            gap: 20px;
            align-items: center;
          }
          #left-tab-scoped .ltab-top-league-info {
            align-items: center; /* Center league info */
          }
          /* --- NEW: Center league details on mobile --- */
          #left-tab-scoped .ltab-league-details {
            justify-content: center;
          }

          /* --- FIX: Simplify grid table for mobile (POS, CLUB, MP, W, D, L, PTS) --- */
          #left-tab-scoped .ltab-grid-table {
            min-width: 100%; /* Allow table to shrink */
            /* Mobile Columns: POS, CLUB, MP, W, D, L, PTS */
            grid-template-columns: 30px 1fr repeat(3, 30px) 40px 40px;
          }

          /* --- FIX: Hide only GF, GA, GD on mobile --- */
          #left-tab-scoped .ltab-grid-header > .gf,
          #left-tab-scoped .ltab-grid-header > .ga,
          #left-tab-scoped .ltab-grid-header > .gd,
          #left-tab-scoped .ltab-grid-row > .gf,
          #left-tab-scoped .ltab-grid-row > .ga,
          #left-tab-scoped .ltab-grid-row > .gd {
            display: none;
          }

          /* --- FIX: Switch responsive team names --- */
          #left-tab-scoped .team-name-mobile { display: inline; }
          #left-tab-scoped .team-name-desktop { display: none; }

          /* Adjust padding on mobile for tighter columns */
          #left-tab-scoped .ltab-grid-row > div,
          #left-tab-scoped .ltab-grid-header > div {
            padding: 10px 5px;
          }
          #left-tab-scoped .ltab-grid-row .team-cell {
            padding-left: 10px;
          }
          #left-tab-scoped .ltab-grid-header .pos {
            padding-left: 10px;
          }

        }
        /* --- END: Mobile Responsive Styles --- */

      `}</style>

      <div>
        {/* TABS (Renamed 'groups' to 'table') */}
        <ul className="nav nav-tabs" id="myTab">
          {['statistics', 'table', 'description'].map(tab => (
            <li key={tab} className={activeTab === tab ? 'active' : ''}>
              <a
                href={`#${tab}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
              >
                {tab.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>

        {/* CONTENT TABS */}
        <div className="tab-content">
          {/* STATISTICS */}
          <div className={`tab-pane ${activeTab === 'statistics' ? 'active' : ''}`} id="statistics">
            <div className="row">
              {/* Club Ranking */}
              <div className="col-lg-4">
                <div className="club-ranking">
                  <h5><a href="group-list.html">Club Ranking (UCL Titles)</a></h5>
                  <div className="info-ranking">
                    <ul>
                      {[
                        { name: 'Real Madrid', titles: 15 },
                        { name: 'AC Milan', titles: 7 },
                        { name: 'Bayern Munich', titles: 6 },
                        { name: 'Liverpool', titles: 6 },
                        { name: 'Barcelona', titles: 5 },
                        { name: 'Ajax', titles: 4 },
                        { name: 'Inter Milan', titles: 3 },
                        { name: 'Manchester United', titles: 3 }
                      ].map((club, index) => (
                        <li key={club.name}>
                          <span className="position">{index + 1}</span>
                          <a href="single-team.html">
                            <img src={getTeamLogo(club.name)} alt={club.name} />
                            {club.name}
                          </a>
                          <span className="points">{club.titles}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Matches (Optional Static/Mapped) */}
              <RecentMatches
                recentMatches={recentMatches}
                loading={loading}
                error={error}
                refetch={() => {}}
                formatMatchDate={formatMatchDate}
                getTeamLogo={getTeamLogo}
              />

              <TopScorers />
            </div>
          </div>

          {/* --- NEW TABLE TAB --- */}
          <div className={`tab-pane ${activeTab === 'table' ? 'active' : ''}`} id="table">
            
            {/* --- League Selector --- */}
            <div className="ltab-league-selector">
              {LEAGUE_SOURCES.map(league => (
                <button
                  key={league.key}
                  className={`ltab-league-btn ${selectedLeague === league.key ? 'active' : ''}`}
                  onClick={() => setSelectedLeague(league.key)}
                >
                  {league.label}
                </button>
              ))}
            </div>

            {loadingTable && <p className="ltab-loading-error-msg">Loading table...</p>}
            {errorTable && <p className="ltab-loading-error-msg">Error: {errorTable}</p>}
            
            {!loadingTable && !errorTable && topClub && (
              <>
                {/* --- FIX: Updated Top Club Highlight layout --- */}
                <div className="ltab-top-club">
                  {/* Left Column */}
                  <div className="ltab-top-league-info">
                    {competitionEmblem && <img src={competitionEmblem} alt={competitionName} className="ltab-league-logo" />}
                    <h5>Top of the {competitionName}</h5>
                    {/* --- NEW: Added Details --- */}
                    <div className="ltab-league-details">
                      {countryFlag && (
                        <div className="detail-item">
                          <img src={countryFlag} alt={countryName} />
                          <span>{countryName}</span>
                        </div>
                      )}
                      {currentMatchday && (
                        <div className="detail-item">
                          <span>Matchday: {currentMatchday}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="ltab-top-club-details">
                    <img src={topClub.team.crest} alt={topClub.team.name} />
                    <h4 className="club-name">{topClub.team.name}</h4>
                    <span className="club-stats">
                      <strong>{topClub.points}</strong> PTS | <strong>{topClub.playedGames}</strong> Played
                    </span>
                  </div>
                </div>
                {/* --- END: Top Club Highlight --- */}


                {/* --- CSS Grid Table --- */}
                <div className="ltab-grid-wrapper">
                  <div className="ltab-grid-table">
                    
                    {/* Grid Header Row */}
                    <div className="ltab-grid-header">
                      <div className="pos">POS</div>
                      <div>CLUB</div>
                      <div className="mp">MP</div>
                      <div className="w">W</div>
                      <div className="d">D</div>
                      <div className="l">L</div>
                      <div className="gf">GF</div>
                      <div className="ga">GA</div>
                      <div className="gd">GD</div>
                      <div className="pts">Pts</div>
                    </div>

                    {/* Grid Body Rows (Mapped) */}
                    {tableData.map(row => (
                      <div className="ltab-grid-row" key={row.team.id}>
                        <div className="pos">{row.position}</div>
                        <div className="team-cell"> 
                          <img src={row.team.crest} alt={row.team.shortName} />
                          {/* --- FIX: Responsive Team Names --- */}
                          <span className="team-name-desktop">{row.team.name}</span>
                          <span className="team-name-mobile">{row.team.tla}</span>
                        </div>
                        <div className="mp">{row.playedGames}</div>
                        <div className="w">{row.won}</div>
                        <div className="d">{row.draw}</div>
                        <div className="l">{row.lost}</div>
                        <div className="gf">{row.goalsFor}</div>
                        <div className="ga">{row.goalsAgainst}</div>
                        <div className="gd">{row.goalDifference}</div>
                        <div className="pts">{row.points}</div>
                      </div>
                    ))}

                  </div>
                </div>
                {/* --- END: CSS Grid Table --- */}
              </>
            )}
          </div>

          {/* --- DESCRIPTION TAB --- */}
          <div className={`tab-pane ${activeTab === 'description' ? 'active' : ''}`} id="description">
            <div className="ltab-tournament-description">
              <h5>About This Section</h5>
              <p>
                This section provides key statistics, league table information, and details about Europe's top football leagues.
              </p>
              <p>
                The "Statistics" tab shows the all-time club rankings based on the number of UCL titles won. The "Table" tab displays the current Top 3 standings for the selected league.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div> 
  );
};

export default LeftTab;