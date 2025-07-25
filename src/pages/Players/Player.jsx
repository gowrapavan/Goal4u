import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import playersData from "../../../public/data/players/players.json";
import { Helmet } from "react-helmet-async";
import "./player.css";

const MAX_VISIBLE_PLAYERS_DESKTOP = 10;

const PlayersByClub = () => {
  const scrollRefs = useRef({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollToNext = (teamIndex) => {
    const container = scrollRefs.current[teamIndex];
    if (container) {
      const cardWidth = 146;
      const scrollAmount = cardWidth * 2;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleExpand = (teamIndex) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamIndex]: !prev[teamIndex],
    }));
  };

  const getCompetitionFlag = (comp) => {
    const flags = {
      BRA: "🇧🇷", ARG: "🇦🇷", GER: "🇩🇪", FRA: "🇫🇷", ESP: "🇪🇸",
      ENG: "🇬🇧", POR: "🇵🇹", ITA: "🇮🇹", NED: "🇳🇱", BEL: "🇧🇪",
      POL: "🇵🇱", CRO: "🇭🇷", URU: "🇺🇾", COL: "🇨🇴", CHI: "🇨🇱",
    };
    return flags[comp] || "⚽";
  };

  const getCardStyleByCompetition = (comp) => {
    const styles = {
      BRA: "#009b3a,#ffcc29", ARG: "#75aadb,#fefefe", GER: "#000,#dd0000,#ffcc00",
      FRA: "#0055a4,#fff,#ef4135", ESP: "#aa151b,#f1bf00", ENG: "#00247d,#ffffff",
      POR: "#006600,#ff0000", ITA: "#008C45,#F4F5F0,#CD212A", NED: "#21468B,#FFFFFF,#AE1C28",
      BEL: "#000000,#FFD700,#FF0000", POL: "#dc143c,#ffffff", CRO: "#ffffff,#ff0000",
      URU: "#68add8,#fff", COL: "#ffe000,#0033a0,#ce1126", CHI: "#0033a0,#ffffff,#d52b1e",
    };
    const gradient = styles[comp] || "#ddd,#bbb";
    return { background: `linear-gradient(145deg, ${gradient})`, color: "#000" };
  };

  return (
    <>
      <Helmet>
        <title>Football Stars by Club & Country | Goal4U</title>
        <meta name="description" content="Explore top football players grouped by clubs and national competitions—view stats, photos, and career insights on Goal4U." />
        <meta property="og:title" content="Top Football Players by Club — Goal4U" />
        <meta property="og:description" content="Get to know players by club, league, and nationality. Detailed profiles including goals, career span, and physical stats." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://goal4u.netlify.app/players" />
        <meta property="og:image" content="https://goal4u.netlify.app/assets/img/og-players.jpg" />
        <link rel="canonical" href="https://goal4u.netlify.app/players" />
      </Helmet>

      <div className="players-wrapper">
        {playersData.map((group, index) => {
          const isExpanded = expandedTeams[index];
          const visiblePlayers = isExpanded || isMobile
            ? group.players
            : group.players.slice(0, MAX_VISIBLE_PLAYERS_DESKTOP);

          return (
            <div key={index} className="team-block">
              <h2 className="team-title">{group.teamGroup}</h2>

              <div className="players-scroll-container" ref={(el) => (scrollRefs.current[index] = el)}>
                <div className="players-row">
                  {visiblePlayers.map((player, i) => (
                    <div
                      key={player.JerseyNo}
                      className="card"
                      style={getCardStyleByCompetition(player.Competition)}
                    >
                      <div
                        className="card-img"
                        style={{ backgroundImage: `url(${player.PhotoUrl})` }}
                      >
                        <span className="badge">{player.JerseyNo}</span>
                        <span className="flag-overlay">{getCompetitionFlag(player.Competition)}</span>
                        <img className="team-logo" src={player.TeamLogo} alt={player.Team} />
                      </div>
                      <div className="card-content">
                        <h3 className="player-name">{player.Name}</h3>
                        <div className="main-line">
                          {getCompetitionFlag(player.Competition)} ⚽ {player.Goals} • {player.Position}
                        </div>
                        <div className="career-span">{player.CareerSpan}</div>
                        <div className="physical-stats">
                          <span>{player.Height}</span>
                          <span>{player.Weight}</span>
                          <span>{new Date().getFullYear() - new Date(player.DOB).getFullYear()}y</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show expand toggle beside last visible card */}
                  {!isMobile && group.players.length > MAX_VISIBLE_PLAYERS_DESKTOP && (
                    <div className="expand-toggle-wrapper">
                      <button
                        className="expand-toggle"
                        onClick={() => toggleExpand(index)}
                        aria-label={isExpanded ? "Show less" : "Show more"}
                      >
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PlayersByClub;
