import React, { useRef } from "react";
import { ChevronRight } from "lucide-react"; // or the appropriate package
import playersData from "../../public/data/players/players.json";

const PlayersByClub = () => {
   const scrollRefs = useRef({});

  const scrollToNext = (teamIndex) => {
    const container = scrollRefs.current[teamIndex];
    if (container) {
      const cardWidth = 146; // card width + margin
      const scrollAmount = cardWidth * 2;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const getCompetitionFlag = (comp) => {
    const flags = {
      BRA: "🇧🇷", ARG: "🇦🇷", GER: "🇩🇪", FRA: "🇫🇷",
      ESP: "🇪🇸", ENG: "🇬🇧", POR: "🇵🇹", ITA: "🇮🇹",
      NED: "🇳🇱", BEL: "🇧🇪", POL: "🇵🇱", CRO: "🇭🇷",
      URU: "🇺🇾", COL: "🇨🇴", CHI: "🇨🇱"
    };
    return flags[comp] || "⚽";
  };

  const getCardStyleByCompetition = (comp) => {
    switch (comp) {
      case "BRA": return { background: "linear-gradient(145deg, #009b3a, #ffcc29)", color: "#000" };
      case "ARG": return { background: "linear-gradient(145deg, #75aadb, #fefefe)", color: "#000" };
      case "GER": return { background: "linear-gradient(145deg, #000, #dd0000, #ffcc00)", color: "#000" };
      case "FRA": return { background: "linear-gradient(145deg, #0055a4, #fff, #ef4135)", color: "#000" };
      case "ESP": return { background: "linear-gradient(145deg, #aa151b, #f1bf00)", color: "#000" };
      case "ENG": return { background: "linear-gradient(145deg, #00247d, #ffffff)", color: "#000" };
      case "POR": return { background: "linear-gradient(145deg, #006600, #ff0000)", color: "#000" };
      case "ITA": return { background: "linear-gradient(145deg, #008C45, #F4F5F0, #CD212A)", color: "#000" };
      case "NED": return { background: "linear-gradient(145deg, #21468B, #FFFFFF, #AE1C28)", color: "#000" };
      case "BEL": return { background: "linear-gradient(145deg, #000000, #FFD700, #FF0000)", color: "#000" };
      case "POL": return { background: "linear-gradient(145deg, #dc143c, #ffffff)", color: "#000" };
      case "CRO": return { background: "linear-gradient(145deg, #ffffff, #ff0000)", color: "#000" };
      case "URU": return { background: "linear-gradient(145deg, #68add8, #fff)", color: "#000" };
      case "COL": return { background: "linear-gradient(145deg, #ffe000, #0033a0, #ce1126)", color: "#000" };
      case "CHI": return { background: "linear-gradient(145deg, #0033a0, #ffffff, #d52b1e)", color: "#000" };
      default: return { background: "linear-gradient(145deg, #ddd, #bbb)", color: "#000" };
    }
  };

  return (
    <div className="players-wrapper">
      {playersData.map((group, index) => (
        <div key={index} className="team-block">
          
          <h2 className="team-title">{group.teamGroup}</h2>

          <div className="players-scroll-container">
            <div className="players-row">
              {group.players.map((player) => (
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
            </div>
            <button 
              className="scroll-indicator"
              onClick={() => scrollToNext(index)}
              aria-label="Scroll to next players"
            >
              <ChevronRight size={24} />
            </button>          
            </div>
        </div>
      ))}

     <style jsx>{`
  .players-wrapper {
    padding: 30px 16px;
    font-family: 'Segoe UI', sans-serif;
  }

  .team-block {
    margin-bottom: 50px;
  }

  .team-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 14px;
    color: #222;
  }

  .players-scroll-container {
    position: relative;
  }

  .players-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 15px;
  }

  .card {
    border-radius: 7px;
    overflow: hidden;
    box-shadow: 0  10px 10px rgba(23, 203, 17, 0.15);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease;
    background: #fff;
  }

  .card:hover {
    transform: translateY(-4px);
  }

  .card-img {
    height: 160px;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  .badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .flag-overlay {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 14px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  }

  .team-logo {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: transparent;
    background-shadow: rgba(0, 0, 0, 0.1);
    padding: 2px;
    object-fit: contain;
  }

  .card-content {
    padding: 12px 5px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 5px;
    flex: 1;
    min-height: 140px;
    backdrop-filter: blur(10px);
    position: relative;
  }

  .player-name {
    font-weight: 700;
    font-size: 1.05rem;
    margin: 0;
    color: #0f172a;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #1e293b, #475569);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .main-line {
    font-size: 0.85rem;
    color: #334155;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(124, 58, 237, 0.05);
    border-radius: 5px;
    border: 1px solid rgba(124, 58, 237, 0.1);
  }

  .career-span {
    font-size: 0.75rem;
    color: #64748b;
    font-style: italic;
    margin: 0;
    padding: 3px 10px;
    background: rgba(100, 116, 139, 0.08);
    border-radius: 5px;
    display: inline-block;
  }

  .physical-stats {
    font-size: 0.75rem;
    color: #334155;
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    gap: 10px;
    font-weight: 500;
    margin-top: auto;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.02), rgba(6, 182, 212, 0.02));
    border-radius: 0 0 16px 16px;
  }

  .physical-stats span {
    padding: 3px 6px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
  }

  .physical-stats span:hover {
    background: rgba(124, 58, 237, 0.08);
    border-color: rgba(124, 58, 237, 0.15);
  }

  .scroll-indicator {
    display: none;
  }
     
  /* Small Desktops */
@media (min-width: 1200px) {
  .players-row {
    grid-template-columns: repeat(6, 1fr);
  }
}
/* Small Desktops */
@media (min-width: 1400px) {
  .players-row {
    grid-template-columns: repeat(7, 1fr);
  }
}

/* Large Desktops or Zoomed-Out Views */
@media (min-width: 1600px) {
  .players-row {
    grid-template-columns: repeat(9, 1fr);
  }
}
  


/* Large Desktops or Zoomed-Out Views */
@media (min-width: 2000px) {
  .players-row {
    grid-template-columns: repeat(11, 1fr);
  }
}
  /* Large Desktops or Zoomed-Out Views */
@media (min-width: 2200px) {
  .players-row {
    grid-template-columns: repeat(13, 1fr);
  }
}
  /* Large Desktops or Zoomed-Out Views */
@media (min-width: 2400px) {
  .players-row {
    grid-template-columns: repeat(16, 1fr);
  }
}

  @media (max-width: 1068px) {
    .players-row {
      display: flex;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding-bottom: 10px;
      gap: 2px;
    }

    .card {
      flex: 0 0 auto;
      width: 140px;
      margin-right: 6px;
      max-height: 220px;
    }

    .card-content {
      padding: 8px 6px;
      gap: 3px;
      min-height: auto;
    }

    .player-name {
      font-size: 0.78rem;
      line-height: 1.1rem;
    }

    .main-line {
      font-size: 0.65rem;
      padding: 2px 4px;
      gap: 4px;
    }

    .career-span {
      font-size: 0.6rem;
      padding: 1px 4px;
    }

    .physical-stats {
    gap: 6px;
    padding: 6px 8px;
  }
    .team-logo {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: transparent;
    padding: 2px;
    object-fit: contain;
  }

  .physical-stats span {
    font-size: 0.7rem;
    padding: 2px 4px;
  }
}

    .scroll-indicator {
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15));
        border-radius: 50%;
        border: 2px solid rgba(34, 197, 94, 0.3);
        backdrop-filter: blur(15px);
        color: rgba(34, 197, 94, 0.9);
        user-select: none;
        cursor: pointer;
        animation: pulseGreen 2.5s infinite;
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.2), 
                    0 0 0 0 rgba(34, 197, 94, 0.4);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;
        z-index: 10;
      }

      .scroll-indicator:hover {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.25));
        border-color: rgba(34, 197, 94, 0.5);
        color: rgba(34, 197, 94, 1);
        transform: translateY(-50%) scale(1.15);
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3), 
                    0 0 0 8px rgba(34, 197, 94, 0.1);
        animation: none;
      }

      .scroll-indicator:active {
        transform: translateY(-50%) scale(1.05);
        box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
      }

      .scroll-indicator:focus {
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.2), 
                    0 0 0 4px rgba(34, 197, 94, 0.3);
      }

      @keyframes pulseGreen {
        0%, 100% { 
          opacity: 0.8;
          transform: translateY(-50%) scale(1);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.2), 
                      0 0 0 0 rgba(34, 197, 94, 0.4);
        }
        50% { 
          opacity: 1;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3), 
                      0 0 0 6px rgba(34, 197, 94, 0.2);
        }
      }
    }
  }
`}</style>


    </div>
  );
};

export default PlayersByClub;
