import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "./common/LoadingSpinner";
import {
  getAreas,
  getCompetitions,
  getTeamsByCompetition,
  getPlayersByTeam,
} from "../services/playerService";
import { getTeamLogoByKey } from "../services/teamlogo";
import { FaHome, FaFlag, FaTrophy, FaTshirt, FaUser } from "react-icons/fa";
const TOP_CLUBS = [
  // Spain (La Liga - esp)
  { name: "Real Madrid FC", key: "RMA", comp: "esp" },
  { name: "FC Barcelona", key: "FCB", comp: "esp" },
  { name: "Atlético Madrid", key: "ATL", comp: "esp" },
  { name: "Sevilla FC", key: "SEV", comp: "esp" },
  { name: "Real Sociedad", key: "RSO", comp: "esp" },
  { name: "Real Betis", key: "BET", comp: "esp" },
  { name: "Villarreal CF", key: "VIL", comp: "esp" },

  // England (Premier League - epl)
  { name: "Manchester City FC", key: "MNC", comp: "epl" },
  { name: "Arsenal FC", key: "ARS", comp: "epl" },
  { name: "Liverpool FC", key: "LIV", comp: "epl" },
  { name: "Manchester United FC", key: "MUN", comp: "epl" },
  { name: "Chelsea FC", key: "CHE", comp: "epl" },
  { name: "Tottenham Hotspur FC", key: "TOT", comp: "epl" },
  { name: "Newcastle United FC", key: "NEW", comp: "epl" },
  { name: "Aston Villa FC", key: "AVL", comp: "epl" },

  // Germany (Bundesliga - DEB)
  { name: "FC Bayern München", key: "BMU", comp: "DEB" },
  { name: "Borussia Dortmund", key: "BVB", comp: "DEB" },
  { name: "RB Leipzig", key: "RBL", comp: "DEB" },
  { name: "Bayer 04 Leverkusen", key: "LEV", comp: "DEB" },
  { name: "Eintracht Frankfurt", key: "SGE", comp: "DEB" },
  { name: "Borussia Mönchengladbach", key: "BMG", comp: "DEB" },

  // Italy (Serie A - ITSA)
  { name: "Juventus FC", key: "JUV", comp: "ITSA" },
  { name: "AC Milan", key: "ACM", comp: "ITSA" },
  { name: "Inter Milan", key: "INT", comp: "ITSA" },
  { name: "AS Roma", key: "ROM", comp: "ITSA" },
  { name: "SSC Napoli", key: "NAP", comp: "ITSA" },
  { name: "Lazio", key: "LAZ", comp: "ITSA" },
  { name: "Fiorentina", key: "FIO", comp: "ITSA" },

  // France (Ligue 1 - FRL1)
  { name: "Paris Saint-Germain FC", key: "PSG", comp: "FRL1" },
  { name: "Olympique de Marseille", key: "MAR", comp: "FRL1" },
  { name: "AS Monaco FC", key: "MON", comp: "FRL1" },
  { name: "Olympique Lyonnais", key: "LYO", comp: "FRL1" },
  { name: "Lille OSC", key: "LIL", comp: "FRL1" },
  { name: "Stade Rennais FC", key: "REN", comp: "FRL1" },

  // Portugal (Primeira Liga - PTC)
  { name: "SL Benfica", key: "BEN", comp: "PTC" },
  { name: "FC Porto", key: "FCP", comp: "PTC" },
  { name: "Sporting CP", key: "SCP", comp: "PTC" },
  { name: "SC Braga", key: "BRG", comp: "PTC" },

  // Netherlands (Eredivisie - NED)
  { name: "AFC Ajax", key: "AJA", comp: "NLE" },
  { name: "PSV Eindhoven", key: "PSV", comp: "NLE" },
  { name: "Feyenoord", key: "FEY", comp: "NLE" },

  // Turkey (Süper Lig - TUR)
  { name: "Galatasaray SK", key: "GAL", comp: "SLIG" },
  { name: "Fenerbahçe SK", key: "FEN", comp: "SLIG" },
  { name: "Beşiktaş JK", key: "BES", comp: "SLIG" },
  { name: "Trabzonspor", key: "TRA", comp: "SLIG" },

  // USA (MLS - MLS)
  { name: "Inter Miami CF", key: "MIA", comp: "MLS" },
  { name: "LA Galaxy", key: "LAG", comp: "MLS" },
  { name: "Los Angeles FC", key: "LFC", comp: "MLS" },
  { name: "Seattle Sounders FC", key: "SEA", comp: "MLS" },
  { name: "Atlanta United FC", key: "ATLUTD", comp: "MLS" },
  { name: "New York City FC", key: "NYC", comp: "MLS" },

  // Saudi Arabia (SPL - SPL)
  { name: "Al Nassr FC", key: "NAS", comp: "SPL" },
  { name: "Al Hilal SFC", key: "HIL", comp: "SPL" },
  { name: "Al Ittihad Club", key: "ITT", comp: "SPL" },
  { name: "Al Ahli Saudi FC", key: "AHLI", comp: "SPL" }
];


const Player = () => {
  const [areas, setAreas] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [loading, setLoading] = useState(false);
  const [logos, setLogos] = useState([]);
  const [clubInfo, setClubInfo] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getAreas().then(setAreas);
    getCompetitions().then(setCompetitions);
  }, []);

  useEffect(() => {
    if (!selectedArea && !selectedCompetition && !selectedTeam) {
      Promise.all(
        TOP_CLUBS.map(async (c) => {
          const logo = await getTeamLogoByKey(c.comp, c.key);
          const compTeams = await getTeamsByCompetition(c.comp);
          const team = compTeams.find((t) => t.Key === c.key);
          return team
            ? {
                ...c,
                teamId: team.TeamId,
                logo,
                name: team.Name,
                fullName: team.FullName,
                venue: team.VenueName,
                website: team.Website,
                area: team.AreaName,
              }
            : null;
        })
      ).then((res) => setLogos(res.filter(Boolean)));
    }
  }, [selectedArea, selectedCompetition, selectedTeam]);

  useEffect(() => {
    const clubId = searchParams.get("club");
    if (clubId && competitions.length && areas.length) {
      (async () => {
        for (const comp of competitions) {
          const compTeams = await getTeamsByCompetition(comp.Key);
          const t = compTeams.find((x) => x.TeamId.toString() === clubId);
          if (t) {
            setSelectedArea({ value: t.AreaName, label: t.AreaName });
            setSelectedCompetition({ value: comp.Key, label: comp.Name });
            setSelectedTeam({ value: t.TeamId, label: t.Name });
            setClubInfo(t);
            break;
          }
        }
      })();
    }
  }, [searchParams, competitions, areas]);

  useEffect(() => {
    if (selectedCompetition) {
      getTeamsByCompetition(selectedCompetition.value).then(setTeams);
    } else {
      setTeams([]);
    }
    setSelectedTeam(null);
    setPlayers([]);
    setClubInfo(null);
  }, [selectedCompetition]);

  useEffect(() => {
    if (selectedTeam && selectedCompetition) {
      setLoading(true);
      getPlayersByTeam(selectedCompetition.value, selectedTeam.value)
        .then((plist) => {
          setPlayers(plist);
          const t = teams.find((t) => t.TeamId === selectedTeam.value);
          setClubInfo(t);
        })
        .finally(() => setLoading(false));
      navigate(`/players?club=${selectedTeam.value}`, { replace: true });
    }
  }, [selectedTeam, selectedCompetition]);

  const handleTopClubClick = async (club) => {
    const compTeams = await getTeamsByCompetition(club.comp);
    const t = compTeams.find((x) => x.Key === club.key);
    if (t) {
      setSelectedArea({ value: t.AreaName, label: t.AreaName });
      setSelectedCompetition({ value: club.comp, label: competitions.find((c) => c.Key === club.comp)?.Name });
      setSelectedTeam({ value: t.TeamId, label: t.Name });
      setClubInfo(t);
      navigate(`/players?club=${t.TeamId}`, { replace: true });
    }
  };

  const areaOpts = areas.map((a) => ({ value: a.Name, label: a.Name }));
  const compOpts = competitions.filter((c) => c.AreaName === selectedArea?.value).map((c) => ({ value: c.Key, label: c.Name }));
  const teamOpts = teams.map((t) => ({ value: t.TeamId, label: t.Name }));
  const pclass = (pos) => ({ D: "defender", M: "midfielder", A: "forward", GK: "goalkeeper" }[pos] || "");
  const calcAge = (d0) => Math.floor((Date.now() - new Date(d0).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  return (
    <div className="container padding-top">
      {/* Filters */}
      <div className="nav-bar">
        <button className="home-btn" onClick={() => navigate("/")}>
          <FaHome />
        </button>
        {["Country", "Competition", "Club", "Player"].map((s, i) => (
          <div key={i} className="nav-step">
            {i === 0 ? <FaFlag /> : i === 1 ? <FaTrophy /> : i === 2 ? <FaTshirt /> : <FaUser />}
            <span>{s}</span>
          </div>
        ))}
      </div>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <label className="filter-label">Country</label>
          <Select options={areaOpts} value={selectedArea} onChange={setSelectedArea} isClearable classNamePrefix="select" />
        </div>
        <div className="col-md-4 mb-3">
          <label className="filter-label">League</label>
          <Select options={compOpts} value={selectedCompetition} onChange={setSelectedCompetition} isDisabled={!selectedArea} isClearable classNamePrefix="select" />
        </div>
        <div className="col-md-4 mb-3">
          <label className="filter-label">Club</label>
          <Select options={teamOpts} value={selectedTeam} onChange={setSelectedTeam} isDisabled={!selectedCompetition} isClearable classNamePrefix="select" />
        </div>
      </div>

      {/* Top Clubs */}
      {!selectedArea && !selectedCompetition && !selectedTeam && logos.length > 0 && (
        <div className="top-clubs">
          {logos.map((c) => (
            <div key={c.teamId} className="club-card" onClick={() => handleTopClubClick(c)}>
              <img src={c.logo} alt={c.name} />
              <span className="club-name">{c.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Club Info */}
      {clubInfo && (
        <div className="club-info">
          <img src={clubInfo.WikipediaLogoUrl} alt={clubInfo.Name} />
          <div>
            <h2>{clubInfo.Name}</h2>
            <p>{clubInfo.FullName}</p>
            {clubInfo.VenueName && <p>🏟️ {clubInfo.VenueName}</p>}
            {clubInfo.Website && (
              <p>
                🌐 <a href={clubInfo.Website} target="_blank" rel="noreferrer">{clubInfo.Website}</a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Player List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="row portfolioContainer">
          {players.map((p, i) => (
            <div key={p.PlayerId} className={`col-xl-3 col-lg-4 col-md-6 ${pclass(p.PositionCategory)} wow fadeInUp`}>
              <div className="item-player">
                <div className="head-player">
                  <img src={p.PhotoUrl} alt={p.CommonName} />
                  <div className="overlay"><a href={`/player/${p.PlayerId}`}>+</a></div>
                </div>
                <div className="info-player">
                  <span className="number-player">{p.Jersey || "?"}</span>
                  <h4>{p.CommonName}<span>{p.PositionCategory}</span></h4>
                  <ul>
                    <li><strong>NATIONALITY</strong> <img src={`/img/flags/${p.Nationality?.toLowerCase()}.png`} alt={p.Nationality} onError={(e) => (e.target.style.display = "none")} /> {p.Nationality}</li>
                    <li><strong>HEIGHT:</strong> <span>{p.Height ? `${p.Height} cm` : "-"}</span></li>
                    <li><strong>WEIGHT:</strong> <span>{p.Weight ? `${p.Weight} kg` : "-"}</span></li>
                    <li><strong>AGE:</strong> <span>{calcAge(p.BirthDate)}</span></li>
                  </ul>
                </div>
                <a href={`/player/${p.PlayerId}`} className="btn">View Player <i className="fa fa-angle-right" /></a>
              </div>
            </div>
          ))}
        </div>
      )}

     <style jsx="true">{`
  .top-clubs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .club-card {
    cursor: pointer;
    background: #fff;
    border-radius: 10px;
    text-align: center;
    padding: 16px;
    box-shadow: 0 0 12px rgba(0, 255, 0, 0.3); /* green glow */
    transition: transform 0.2s ease;
  }
  .club-card:hover {
    transform: translateY(-4px);
  }
  .club-card img {
    width: 100%;
    height: 90px;
    object-fit: contain;
    margin-bottom: 8px;
    background: transparent !important;
  }
  .club-name {
    font-size: 14px;
    font-weight: bold;
  }
  .club-info {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .club-info img {
    width: 120px;
    height: 120px;
    object-fit: contain;
    background: transparent !important;
    padding: 0;
    box-shadow: none;
  }
  .club-info h2 { margin: 0; font-size: 1.6rem; }
  .club-info p { margin: 4px 0; }

  @media (max-width: 600px) {
    .club-card img { height: 70px; }
    .club-name { font-size: 14px; }
    .club-info img { width: 80px; height: 80px; }
  }

  .nav-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .home-btn {
    background-color: rgb(41, 163, 4);
    color: #fff;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

  .nav-step {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    background: #f2f2f2;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .filter-label {
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .select__control {
    border-radius: 6px;
    min-height: 36px;
    font-size: 13px;
  }

  .select__menu {
    z-index: 100;
  }

  .item-player {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    transition: transform 0.2s ease;
  }

  .item-player:hover {
    transform: translateY(-5px);
  }

  .head-player img {
    width: 100%;
  }

  .overlay {
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.4);
    padding: 4px 8px;
  }

  .overlay a {
    color: white;
    font-size: 18px;
  }

  .info-player {
    padding: 10px;
  }

  .info-player h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .info-player h4 span {
    display: block;
    font-size: 11px;
    color: #999;
  }

  .info-player ul {
    padding: 0;
    list-style: none;
    margin-top: 10px;
  }

  .info-player ul li {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .btn {
    margin: 10px;
    padding: 6px 12px;
    background: #007bff;
    color: #fff;
    border-radius: 5px;
    font-size: 12px;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .nav-step {
      font-size: 10px;
    }

    .home-btn {
      font-size: 12px;
      padding: 4px 8px;
    }

    .filter-label {
      font-size: 11px;
    }
  }
`}</style>

    </div>
  );
};

export default Player;
