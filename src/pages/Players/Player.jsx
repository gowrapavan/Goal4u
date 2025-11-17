import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertCircle, User, Shield } from "lucide-react";
import "./player.css"; // We will create this new CSS file

// --- Configuration ---
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/teams/";
// Added all your leagues
const LEAGUE_FILES = [
  "ESP", "EPL", "DEB", "BSA", "DED", "EC", "ELC", 
  "FRL1", "ITSA", "POR", "UCL", "WC"
];
const DEFAULT_LEAGUE = "ESP";

// --- Helper Functions ---

// Calculates age from date string
const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  return isNaN(age) ? "N/A" : age;
};

// Component for the Player Card (handles skeleton)
const PlayerCard = ({ player }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = player.image && !imgError;

  return (
    <div className="player-card">
      <div className="player-card-image">
        {hasImage ? (
          <img 
            src={player.image} 
            alt={player.name} 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="skeleton-placeholder">
            <User size={48} />
          </div>
        )}
      </div>
      <div className="player-card-content">
        <h3 className="player-name">{player.name}</h3>
        <p className="player-detail">{player.position || "Unknown"}</p>
        <div className="player-meta">
          <span>{player.nationality}</span>
          <span>Age: {calculateAge(player.dateOfBirth)}</span>
        </div>
      </div>
    </div>
  );
};


// --- Main Page Component ---
const PlayersPage = () => {
  const [allLeagues, setAllLeagues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedLeagueCode, setSelectedLeagueCode] = useState(DEFAULT_LEAGUE);
  const [selectedClubId, setSelectedClubId] = useState(null);

  // 1. Fetch and organize all data on load (FIXED VERSION)
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const promises = LEAGUE_FILES.map(code => 
          fetch(`${GITHUB_RAW_URL}${code}.json`).then(res => {
            if (!res.ok) throw new Error(`Failed to load ${code}.json`);
            return res.json();
          })
        );
        
        const leagueResults = await Promise.all(promises);
        
        const leaguesData = {};
        
        leagueResults.forEach((teams, index) => {
          if (teams.length === 0) return; // Skip empty files
          
          const leagueCode = LEAGUE_FILES[index];
          
          // --- START FIX: Robust League Info Retrieval ---
          let leagueInfo;
          const firstTeam = teams[0];

          // First, try to find a "LEAGUE" type competition
          if (firstTeam && firstTeam.runningCompetitions && firstTeam.runningCompetitions.length > 0) {
            leagueInfo = firstTeam.runningCompetitions.find(c => c.type === "LEAGUE");
            
            // If no "LEAGUE" type, just grab the first one in the list
            if (!leagueInfo) {
              leagueInfo = firstTeam.runningCompetitions[0];
            }
          }

          // If still no leagueInfo (e.g., empty array), use the team's 'area' as a fallback
          // This is perfect for UCL (Area: Europe) or WC (Area: World)
          if (!leagueInfo && firstTeam && firstTeam.area) {
            leagueInfo = {
              name: firstTeam.area.name,
              emblem: firstTeam.area.flag // The area flag is a great emblem
            };
          }
          
          // As a final fallback, just use the code
          if (!leagueInfo) {
            leagueInfo = {
              name: leagueCode,
              emblem: null // No image
            };
          }
          // --- END FIX ---

          // Now this is safe and will not crash
          leaguesData[leagueCode] = {
            code: leagueCode,
            name: leagueInfo.name,
            emblem: leagueInfo.emblem,
            teams: teams,
          };
        });

        setAllLeagues(leaguesData);
        
        // Set default selected club
        const defaultLeagueData = leaguesData[DEFAULT_LEAGUE];
        if (defaultLeagueData && defaultLeagueData.teams.length > 0) {
          setSelectedClubId(defaultLeagueData.teams[0].id);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // 2. Handle League selection
  const handleLeagueSelect = (leagueCode) => {
    setSelectedLeagueCode(leagueCode);
    // Set selected club to the first club of the new league
    const newLeague = allLeagues[leagueCode];
    if (newLeague && newLeague.teams.length > 0) {
      setSelectedClubId(newLeague.teams[0].id);
    } else {
      setSelectedClubId(null);
    }
  };

  // 3. Get derived data for rendering
  const currentLeague = allLeagues[selectedLeagueCode];
  const currentClubs = currentLeague ? currentLeague.teams : [];
  const selectedClub = currentClubs.find(club => club.id === selectedClubId);
  
  // --- Render States ---
  if (loading) {
    return (
      <div className="page-status-container">
        <Loader2 className="animate-spin" size={48} />
        <p>Loading all leagues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-status-container error">
        <AlertCircle size={48} />
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <>
      <Helmet>
        <title>Football Players by League & Club | Goal4U</title>
        <meta name="description" content="Browse football players, sorted by league and club. See detailed squad lists for ESP, EPL, and more." />
      </Helmet>

      <div className="players-page-container">
        
        {/* === League Selector (Top Bar) === */}
        <nav className="league-selector">
          {Object.values(allLeagues).map(league => (
            <button
              key={league.code}
              className={`league-button ${league.code === selectedLeagueCode ? 'active' : ''}`}
              onClick={() => handleLeagueSelect(league.code)}
              title={league.name}
            >
              <img src={league.emblem} alt={league.name} className="league-emblem" />
              <span>{league.code}</span>
            </button>
          ))}
        </nav>

        {/* === Main Content (Sidebar + Player Grid) === */}
        <div className="players-main-content">
          
          {/* --- Club Sidebar (Left) --- */}
          <aside className="players-sidebar">
            <h2 className="sidebar-title">
              <img src={currentLeague?.emblem} alt={currentLeague?.name} />
              <span>{currentLeague?.name}</span>
            </h2>
            <div className="club-list">
              {currentClubs.map(club => (
                <button
                  key={club.id}
                  className={`club-button ${club.id === selectedClubId ? 'active' : ''}`}
                  onClick={() => setSelectedClubId(club.id)}
                >
                  <img src={club.crest} alt={club.name} className="club-crest" />
                  <span className="club-name">{club.name}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* --- Player Content (Right) --- */}
          <main className="players-content">
            {selectedClub ? (
              <>
                <div className="squad-header">
                  <img src={selectedClub.crest} alt={selectedClub.name} />
                  <h2>{selectedClub.name} Squad</h2>
                </div>
                <div className="player-grid">
                  {selectedClub.squad.map(player => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </>
            ) : (
              <div className="page-status-container">
                <Shield size={48} />
                <p>Select a club to see the squad.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default PlayersPage;