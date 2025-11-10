import React from "react";

// Data provided by you
const players = [
  {
    PlayerId: 1,
    Name: "Cristiano Ronaldo",
    Goals: 938,
    League: 572,
    Cup: 56,
    Continental: 172,
    CareerSpan: "2002–present",
    Team: "Al-Nassr / Portugal",
    TeamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Nassr_FC_Logo.svg/250px-Nassr_FC_Logo.svg.png",
    PhotoUrl: "https://media.gettyimages.com/id/81191334/photo/moscow-cristiano-ronaldo-of-manchester-united-bites-his-winners-medal-following-his-teams.jpg?s=612x612&w=0&k=20&c=wwKYbDP8vOag5rOVTjFxmDhrvWM8BPQ5yLqnfgf4ko8=",
    Competition: "POR",
    Position: "FW"
  },
  {
    PlayerId: 2,
    Name: "Lionel Andrés Messi ",
    Goals: 868,
    League: 530,
    Cup: 71,
    Continental: 155,
    CareerSpan: "2004–present",
    Team: "Inter Miami / Argentina",
    TeamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/250px-Inter_Miami_CF_logo.svg.png",
    PhotoUrl: "https://media.gettyimages.com/id/2160666532/photo/houston-texas-lionel-messi-of-argentina-looks-on-during-the-conmebol-copa-america-2024.jpg?s=612x612&w=0&k=20&c=slySJwoirkOBmXiQXyKiXO530f3lFNXJz5tWJy444g0=",
    Competition: "ARG",
    Position: "FW"
  },
  {
    PlayerId: 3,
    Name: "Pelé",
    Goals: 762,
    League: 604,
    Cup: 49,
    Continental: 26,
    CareerSpan: "1957–1977",
    Team: "Santos / Brazil",
    TeamLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Santos_FC_png.png/640px-Santos_FC_png.png",
    PhotoUrl: "https://media.gettyimages.com/id/900481092/photo/brazilian-striker-pel%C3%A9-wearing-his-santos-jersey-smiles-before-playing-a-friendly-soccer-match.jpg?s=612x612&w=0&k=20&c=ZVf4bWaNALJWi1VfL8F3ahJbObbyEzrqvphHjmnHnEw=",
    Competition: "BRA",
    Position: "ST"
  },
  {
    PlayerId: 4,
    Name: "Romário",
    Goals: 756,
    League: 545,
    Cup: 93,
    Continental: 54,
    CareerSpan: "1985–2007",
    Team: "Brazil",
    TeamLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Brazilian_Football_Confederation_logo.svg/640px-Brazilian_Football_Confederation_logo.svg.png",
    PhotoUrl: "https://media.gettyimages.com/id/79038358/photo/1994-world-cup-finals-stanford-usa-24th-june-brazil-3-v-cameroon-0-brazils-romario-celebrates.jpg?s=612x612&w=0&k=20&c=TEJ22KXK28qBdPJhUKKhYV5mooNgcbUAG_aW3jigCKs=",
    Competition: "BRA",
    Position: "FW"
  },
  {
    PlayerId: 5,
    Name: "Ferenc Puskás",
    Goals: 725,
    League: 516,
    Cup: 69,
    Continental: 56,
    CareerSpan: "1943–1966",
    Team: "Hungary / Real Madrid",
    TeamLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    PhotoUrl: "https://media.gettyimages.com/id/639617733/photo/famous-hungarian-player-ferenc-puskas.jpg?s=612x612&w=0&k=20&c=_a8RXZ_A1JHaCl5aPrn56A-088PPVcNcDlPX2pjXrdE=",
    Competition: "HUN",
    Position: "FW"
  },
  {
    PlayerId: 6,
    Name: "Gerd Müller",
    Goals: 634,
    League: 405,
    Cup: 92,
    Continental: 69,
    CareerSpan: "1964–1981",
    Team: "Germany / Bayern Munich",
    TeamLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bayern_M%C3%BCnchen_Logo_%281996-2002%29.svg/640px-Bayern_M%C3%BCnchen_Logo_%281996-2002%2B.svg.png",
    PhotoUrl: "https://media.gettyimages.com/id/639618093/photo/the-famous-soccer-player-gerd-muller-receiving-his-award-of-top-european-scorer-for-the-1971.jpg?s=612x612&w=0&k=20&c=ERtGyQpvO-1aH4zDEqveGwh7Z1NkNlp-8SavDBmqVkc=",
    Competition: "GER",
    Position: "CF"
  },
  {
    PlayerId: 10,
    Name: "Eusébio da Silva Ferreira",
    Goals: 578,
    League: 381,
    Cup: 97,
    Continental: 59,
    CareerSpan: "1960–1978",
    Team: "Benfica / Portugal",
    TeamLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV0-WwkVXk21-Hkr3JQNqv3Gc6kYabeGCEuA&s",
    PhotoUrl: "https://media.gettyimages.com/id/542874149/photo/1966-fifa-world-cup-in-england-portrait-of-portugal-player-eusebio-with-a-film-camera-june-1966.jpg?s=612x612&w=0&k=20&c=1jd5TUDFx0XfT85eJnmRPwfTmFOROz5t4cCMIwRvci8=",
    Competition: "POR",
    Position: "FW"
  },
  {
    PlayerId: 8,
    Name: "Zlatan Ibrahimović",
    Goals: 561,
    League: 394,
    Cup: 48,
    Continental: 57,
    CareerSpan: "1999–2023",
    Team: "Sweden / AC Milan Clubs",
    TeamLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/AC_Milan.png/640px-AC_Milan.png",
    PhotoUrl: "https://media.gettyimages.com/id/1366477062/photo/milan-italy-zlatan-ibrahimovic-of-ac-milan-looks-on-during-the-serie-a-match-between-ac-milan.jpg?s=612x612&w=0&k=20&c=a0QkqbIeaMJkgSvgUjESpHFbMe5e204hTJ_o1riIrK4=",
    Competition: "SWE",
    Position: "ST"
  }
];

const TopScorers = () => {
  const getCompetitionFlag = (comp) => {
    const flags = {
      POR: "🇵🇹",
      ARG: "🇦🇷",
      BRA: "🇧🇷",
      HUN: "🇭🇺",
      GER: "🇩🇪",
      SWE: "🇸🇪",
    };
    return flags[comp] || "⚽";
  };

  return (
    <div className="top-scorers-container">
      <h1 className="top-scorers-title">All-Time Top Scorers</h1>
      <div className="scorers-cards-grid">
        {players.map((player, index) => (
          <div className="scorer-card" key={player.PlayerId}>
            <div className="card-header">
              <img
                src={player.PhotoUrl}
                alt={player.Name}
                className="player-image"
              />
              <span className="rank-badge">#{index + 1}</span>
              <img
                src={player.TeamLogo}
                alt={player.Team}
                className="team-emblem"
              />
              <span className="country-flag">
                {getCompetitionFlag(player.Competition)}
              </span>
            </div>
            <div className="card-body">
              <h2 className="player-name">{player.Name}</h2>
              <div className="main-goals-stat">
                <span className="goals-value">{player.Goals}</span>
                <span className="goals-label">TOTAL GOALS</span>
              </div>
              <div className="other-stats">
                <div className="stat-item">
                  <span className="stat-value">{player.League}</span>
                  <span className="stat-label">League</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">{player.Cup}</span>
                  <span className="stat-label">Cup</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">{player.Continental}</span>
                  <span className="stat-label">Continental</span>
                </div>
              </div>
              <div className="career-info">
                <span>{player.Position}</span>
                <span className="dot-separator">•</span>
                <span>{player.CareerSpan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Updated Styles (Image Size Increased, Text Compact) --- */}
      <style jsx>{`
        /* --- General Reset & Page Container --- */
        .top-scorers-container {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #f0f2f5; /* Light grey background */
          color: #333;
          padding: 20px 15px;
          min-height: 100vh;
          box-sizing: border-box;
        }

        .top-scorers-title {
          font-size: 1.8rem;
          font-weight: 700;
          text-align: center;
          margin: 0 auto 25px auto;
          color: #2c3e50;
          letter-spacing: -0.5px;
        }

        /* --- Grid Layout for Cards --- */
        .scorers-cards-grid {
          display: grid;
          /* Adjusted min-width to accommodate slightly larger image while maintaining a good number of columns */
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
          gap: 15px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* --- Individual Scorer Card --- */
        .scorer-card {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #e7e7e7;
        }

        .scorer-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        }

        /* --- Card Header (Image Section) --- */
        .card-header {
          position: relative;
          height: 160px; /* Increased image height significantly */
          background-color: #eee;
          overflow: hidden;
        }

        .player-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top; /* Center top for better face visibility */
          filter: brightness(0.9);
          transition: transform 0.3s ease;
        }
        
        .scorer-card:hover .player-image {
            transform: scale(1.02);
        }

        /* --- Overlays on Image --- */
        .rank-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          padding: 2px 7px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          z-index: 2;
          backdrop-filter: blur(2px);
        }

        .team-emblem {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 2px;
          object-fit: contain;
          z-index: 2;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }

        .country-flag {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 18px;
          z-index: 2;
          text-shadow: 0 1px 1px rgba(0,0,0,0.15);
        }

        /* --- Card Body (Stats and Info) --- */
        .card-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex-grow: 1;
        }

        .player-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        /* --- Main Goals Stat --- */
        .main-goals-stat {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #e0e0e0;
          width: 100%;
        }

        .goals-value {
          font-size: 2.2rem;
          font-weight: 800;
          color: #28a745;
          line-height: 1;
          display: block;
        }

        .goals-label {
          font-size: 0.75rem;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 3px;
          display: block;
        }

        /* --- Other Stats (League, Cup, Continental) --- */
        .other-stats {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 12px;
          gap: 5px;
        }

        .stat-item {
          flex: 1;
          padding: 0 3px;
        }
        
        .stat-divider {
            width: 1px;
            background-color: #e0e0e0;
            margin: 0 4px;
        }

        .stat-item .stat-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #34495e;
          display: block;
          margin-bottom: 1px;
        }

        .stat-item .stat-label {
          font-size: 0.65rem;
          color: #95a5a6;
          text-transform: capitalize;
        }

        /* --- Career Info Footer --- */
        .career-info {
          font-size: 0.75rem;
          color: #7f8c8d;
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px solid #f0f0f0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
        }
        
        .career-info .dot-separator {
            font-size: 1rem;
            line-height: 0;
            color: #bdc3c7;
        }

        /* --- Responsive Adjustments --- */
        @media (max-width: 768px) {
          .top-scorers-title {
            font-size: 1.6rem;
            margin-bottom: 20px;
          }
          .scorers-cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Slightly adjusted min-width */
            gap: 12px;
          }
          .card-header {
            height: 140px; /* Adjusted height for medium screens */
          }
          .player-name {
            font-size: 1rem;
          }
          .main-goals-stat .goals-value {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .top-scorers-container {
            padding: 15px 8px;
          }
          .scorers-cards-grid {
            grid-template-columns: 1fr; /* Single column on very small screens */
            gap: 10px;
          }
          .card-header {
              height: 120px; /* Adjusted height for small screens */
          }
          .player-name {
              font-size: 1rem;
          }
          .main-goals-stat .goals-value {
            font-size: 1.8rem;
          }
          .other-stats {
            flex-direction: row; 
            justify-content: center;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopScorers;