import React from "react";

const TopScorers = () => {
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
      TeamLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bayern_M%C3%BCnchen_Logo_%281996-2002%29.svg/640px-Bayern_M%C3%BCnchen_Logo_%281996-2002%29.svg.png",
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

  const getCompetitionFlag = (comp) => {
    const flags = {
      POR: "🇵🇹",
      ARG: "🇦🇷",
      BRA: "🇧🇷",
      HUN: "🇭🇺",
      GER: "🇩🇪",
      SWE: "🇸🇪"
    };
    return flags[comp] || "⚽";
  };

  const getCardStyleByCompetition = (comp) => {
    switch (comp) {
      case "POR":
  return { background: "linear-gradient(145deg, #006600, #d62828)", color: "#fff" };
case "ARG":
  return { background: "linear-gradient(145deg, #75aadb, #fefefe)", color: "#000" };
case "BRA":
  return { background: "linear-gradient(145deg, #009b3a, #ffcc29)", color: "#000" };
case "GER":
  return { background: "linear-gradient(145deg, #000, #dd0000, #ffcc00)", color: "#fff" };
case "HUN":
  return { background: "linear-gradient(145deg, #c8102e, #ffffff, #008751)", color: "#000" };
case "SWE":
  return { background: "linear-gradient(145deg, #005bac, #ffcd00)", color: "#000" };
      
    }
  };
  const getFlagStyle = (comp) => {
  switch (comp) {
    case "POR":
      return { color: "#d62828" }; // white on dark green/red
    case "ARG":
      return { color: "#75aadb" }; // black on sky
    case "BRA":
      return { color: "#2DFC1F" }; // dark blue
    case "GER":
      return { color: "#F6E60C" }; // white on black/red/yellow
    case "HUN":
      return { color: "#000" }; // black on white/red/green
    case "SWE":
      return { color: "#002f6c" }; // deep blue
    default:
      return { color: "#fff" }; // fallback
  }
};


  return (
    <div className="topscorers-wrapper">
      <h2 className="header-title">All-Time Top Scorers</h2><br></br>

      <div className="grid-container">
        {players.map((player, index) => (
          <div
            key={player.PlayerId}
            className="card"
            style={getCardStyleByCompetition(player.Competition)}
          >
            <div
              className="card-img"
              style={{ backgroundImage: `url(${player.PhotoUrl})` }}
            >
              <span className="badge">#{index + 1}</span>
<span
  className="flag-overlay"
  style={getFlagStyle(player.Competition)}
>
  {getCompetitionFlag(player.Competition)}
</span>
              <img className="team-logo" src={player.TeamLogo} alt={player.Team} />
            </div>
            <div className="card-content">
              <h3 className="player-name">{player.Name}</h3>

              <div className="stats desktop-only">
                <span>{getCompetitionFlag(player.Competition)}</span>
                <span>⚽ {player.Goals}</span>
                <span>{player.Position}</span>
              </div>

              <div className="extra-stats">
                <p>League: {player.League}</p>
                <p>Cup: {player.Cup}</p>
                <p>Continental: {player.Continental}</p>
                <p>{player.CareerSpan}</p>
              </div>

              <div className="mobile-footer mobile-only">
                {getCompetitionFlag(player.Competition)} ⚽ {player.Goals} · {player.Position}
              </div>
            </div>
          </div>
        ))}
      </div>
<style jsx>{`
  .topscorers-wrapper {
    padding: 40px 20px;
    max-width: 1300px;
    margin: auto;
    text-align: center;
    font-family: 'Segoe UI', sans-serif;
  }

  .header-title {
    font-size: 2.4rem;
    font-weight: 800;
    margin-bottom: 0.4rem;
    color: #111;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2.5rem;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (max-width: 968px) {
    .grid-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 380px) {
    .grid-container {
      grid-template-columns: 1fr;
    }
  }

  .card {
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  .card:hover {
    transform: translateY(-6px);
    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .card-img {
    height: 200px;
    background-size: cover;
    background-position: center;
    position: relative;
    filter: brightness(0.95);
  }

  .badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 5px 10px;
    border-radius: 32px;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.5px;
    z-index: 3;
  }

.flag-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
  z-index: 3;
  letter-spacing: 0.5px;
  /* Remove color: #fff here */
}


  .team-logo {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 34px;
    height: 34px;
    background: #fff;
    padding: 4px;
    border-radius: 50%;
    border: 1px solid #ccc;
    object-fit: contain;
    z-index: 2;
  }

  .card-content {
    padding: 16px;
    background: #FFFF;
    text-align: center;
    position: relative;
    z-index: 1;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .player-name {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 6px;
    color: #111;
  }

  .stats {
    font-size: 0.8rem;
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 8px;
    color: #333;
  }

  .extra-stats {
    font-size: 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    color: #444;
    text-align: center;
  }

  .extra-stats p {
    margin: 0;
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-only {
      display: none;
    }

    .mobile-only {
      display: block;
      font-size: 0.75rem;
      margin-top: 6px;
      color: #333;
    }

    .card-img {
      height: 150px;
    }

    .player-name {
      font-size: 0.95rem;
    }

    .badge {
      font-size: 10px;
      padding: 3px 6px;
    }

    .team-logo {
      width: 26px;
      height: 26px;
    }

    .extra-stats {
      display: none;
    }

    .flag-overlay {
      font-size: 12px;
      padding: 2px 5px;
    }
  }
`}</style>


    </div>
  );
};

export default TopScorers;