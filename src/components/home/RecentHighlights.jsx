import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ LEAGUE MAPPING (Name + Logo)
const getLeagueInfo = (code) => {
  const map = {
    EPL: { name: "Premier League", logo: "https://crests.football-data.org/PL.png" },
    ESP: { name: "La Liga", logo: "https://crests.football-data.org/PD.png" },
    ITSA: { name: "Serie A", logo: "https://crests.football-data.org/SA.png" },
    DEB: { name: "Bundesliga", logo: "https://crests.football-data.org/BL1.png" },
    DED: { name: "Eredivisie", logo: "https://crests.football-data.org/ED.png" },
    FRL1: { name: "Ligue 1", logo: "https://crests.football-data.org/FL1.png" },
    UCL: { name: "UCL", logo: "https://crests.football-data.org/CL.png" },
    MLS: { name: "MLS", logo: null },
    WC: { name: "World Cup", logo: null },
  };
  return map[code] || { name: code, logo: null };
};

// ✅ INTERNAL MATCHCARD COMPONENT
const MatchCard = ({ match, onClick }) => {
  const league = getLeagueInfo(match.league);

  return (
    <div className="rh-card" onClick={onClick}>
      {/* League Header with Logo */}
      <div className="rh-league-header">
        {league.logo && <img src={league.logo} alt={league.name} />}
        <span>{league.name}</span>
      </div>

      {/* Teams */}
      <div className="rh-teams">
        <div className="rh-team">
          <img src={match.home_team.logo} alt={match.home_team.name} />
          <span>{match.home_team.name}</span>
        </div>

        <div className="rh-vs">
          <strong>
            {match.home_team.score} - {match.away_team.score}
          </strong>
          <span>VS</span>
        </div>

        <div className="rh-team">
          <img src={match.away_team.logo} alt={match.away_team.name} />
          <span>{match.away_team.name}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="rh-footer">
        <span>{match.date}</span>
        <button>Watch ▶</button>
      </div>
    </div>
  );
};

export default function RecentHighlights() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  const DATA_URL =
    "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/Highlights/Highlight.json";

  useEffect(() => {
    fetch(DATA_URL, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMatches(sorted.slice(0, 10)); // Top 10 for horizontal scroll
      });
  }, []);

  return (
    <div className="rh-wrapper">
      <h1 className="rh-title">Latest Match Highlights</h1>

      {/* ✅ HORIZONTAL SCROLL CONTAINER */}
      <div className="rh-scroll">
        {matches.map((m) => (
          <MatchCard
            key={m.highlight_id}
            match={m}
            onClick={() => navigate(`/highlight/${m.highlight_id}`)}
          />
        ))}
      </div>

      <style>{`
        .rh-wrapper {
          padding: 28px;
          background: #fdfdfd;
        }

        .rh-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 20px;
          color: #0f172a;
        }

        /* ✅ HORIZONTAL SCROLL STYLES */
        .rh-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding: 10px 4px;
          scroll-behavior: smooth;
          /* Mobile Scroll Snap */
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        /* ✅ CUSTOM SCROLLBAR: HIDDEN UNTIL HOVER/SCROLL */
        .rh-scroll::-webkit-scrollbar {
          height: 6px; /* Keep consistent height */
        }

        /* Track is always transparent so it doesn't take up visual space */
        .rh-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Thumb is transparent by default */
        .rh-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
        }

        /* ✅ Show Scrollbar ONLY when hovering over the container */
        .rh-scroll:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* Grey color on hover */
        }

        /* --- CARD STYLES --- */
        .rh-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #f3f4f6;
          cursor: pointer;
          transition: .2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04);
          
          /* Fixed Dimensions */
          min-width: 260px; 
          width: 260px;
          height: 210px;
          flex-shrink: 0;
          
          /* Layout */
          display: flex;
          flex-direction: column;
          
          /* Snap alignment */
          scroll-snap-align: start;
        }

        .rh-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.1);
          border-color: #16a34a;
        }

        /* League Header */
        .rh-league-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .rh-league-header img { width: 18px; height: 18px; object-fit: contain; }
        .rh-league-header span {
          font-size: 11px;
          font-weight: 800;
          color: #16a34a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rh-teams {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-grow: 1; 
          margin: 6px 0 14px;
        }

        .rh-team {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 70px;
          text-align: center;
        }

        .rh-team img { width: 40px; height: 40px; object-fit: contain; }
        .rh-team span {
          font-size: 11px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rh-vs {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .rh-vs strong {
          display: block;
          font-size: 18px;
          font-weight: 900;
          color: #16a34a;
        }
        
        .rh-vs span {
          font-size: 10px;
          color: #9ca3af;
          font-weight: 600;
        }

        .rh-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
          border-top: 1px solid #f3f4f6;
          padding-top: 12px;
          margin-top: auto; 
        }

        .rh-footer button {
          background: #16a34a;
          border: none;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .rh-footer button:hover { background: #15803d; }

        /* ✅ MOBILE RESPONSIVE QUERIES */
        @media (max-width: 600px) {
          .rh-wrapper { padding: 16px; }
          .rh-title { font-size: 20px; margin-bottom: 16px; }
          .rh-card { min-width: 240px; width: 240px; height: 200px; }
        }
      `}</style>
    </div>
  );
}