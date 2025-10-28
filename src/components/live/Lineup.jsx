import React, { useEffect, useState } from 'react';

const STATS_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/stats/';

// --- Reusable Icon Components ---
const EventIcon = ({ event }) => {
  const baseIconContainerStyle = { position: 'absolute', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  switch (event.type) {
    case 'goal':
      return (
        <div style={{ ...baseIconContainerStyle, bottom: '-5px', left: '-10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>
            <circle cx="12" cy="12" r="10" fill="white" />
            <path fill="black" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10.3,6.36L13.73,6.35L15.75,9.5L13.23,11.3L10.76,9.53L10.3,6.36M8.25,9.5L10.27,6.35L8.79,11.31L8.25,9.5M15.21,11.31L13.73,6.35L15.75,9.5L15.21,11.31M6.27,12.25L8.79,11.3L8.25,9.5L6.37,10.19L6.27,12.25M17.63,10.19L15.75,9.5L15.21,11.3L17.73,12.25L17.63,10.19M13.23,11.3L15.75,9.5L15.21,11.3L13.23,11.3M8.79,11.3L10.75,9.53L10.27,6.35L8.79,11.3M10.76,9.53L13.23,11.3L12,12.35L10.76,9.53M12,12.35L13.23,11.3L13.7,14.47L12,12.35M10.76,9.53L12,12.35L10.3,14.47L10.76,9.53M12,17.64L8.58,17.64L6.56,14.5L9.08,12.7L10.3,14.47L12,17.64M15.42,17.64L12,17.64L13.7,14.47L14.92,12.7L17.44,14.5L15.42,17.64Z"/>
          </svg>
        </div>
      );
    case 'sub_out':
      return (
        <div style={{ ...baseIconContainerStyle, bottom: '-5px', right: '-10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="white" stroke="#e53e3e" strokeWidth="1" />
            <path d="M12 16l-4-4h3V8h2v4h3l-4 4z" fill="#e53e3e" transform="rotate(180 12 12)" />
          </svg>
        </div>
      );
    case 'sub_in':
      return <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#48bb78" /><path d="M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="white" /></svg>;
    case 'yellow_card':
      return <div style={{ position: 'absolute', top: '-6px', right: '-8px', width: '13px', height: '18px', backgroundColor: '#f6e05e', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.8)', transform: 'rotate(15deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />;
    case 'red_card':
      return <div style={{ position: 'absolute', top: '-6px', right: '-8px', width: '13px', height: '18px', backgroundColor: '#e53e3e', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.8)', transform: 'rotate(15deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />;
    default: return null;
  }
};

const Lineup = ({ matchId, competition }) => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId || !competition) return;
    const fetchLineupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${STATS_BASE_URL}${competition.toUpperCase()}.json`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const stats = data.find(m => String(m.GameId) === String(matchId));
        setMatchData(stats || null);
        if (!stats) setError('Lineup not found for this match.');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLineupData();
  }, [matchId, competition]);

  if (loading) return <div className="lineups-section"><p className="status-text">Loading lineups…</p></div>;
  if (error) return <div className="lineups-section"><p className="status-text error">{error}</p></div>;
  if (!matchData || !matchData.Lineups) return null;

  const { Lineups, Events } = matchData;
  const homeLineup = Lineups?.[0];
  const awayLineup = Lineups?.[1];

  const playerEvents = new Map();
  const subbedInPlayerIds = new Set();
  Events.forEach(event => {
    const mainPlayerId = event.player?.id;
    const assistPlayerId = event.assist?.id;
    if (mainPlayerId && !playerEvents.has(mainPlayerId)) playerEvents.set(mainPlayerId, []);
    switch (event.type) {
      case 'Goal': playerEvents.get(mainPlayerId)?.push({ type: 'goal' }); break;
      case 'Card':
        if (event.detail === 'Yellow Card') playerEvents.get(mainPlayerId)?.push({ type: 'yellow_card' });
        else if (event.detail === 'Red Card') playerEvents.get(mainPlayerId)?.push({ type: 'red_card' });
        break;
      case 'subst':
        playerEvents.get(mainPlayerId)?.push({ type: 'sub_out' });
        if (assistPlayerId) subbedInPlayerIds.add(assistPlayerId);
        break;
      default: break;
    }
  });

  const calculatePlayerPositions = (lineup, isTop) => {
    if (!lineup?.startXI) return [];
    const groupedByRow = {};
    lineup.startXI.forEach(({ player }) => {
      if (!player.grid) return;
      const [row] = player.grid.split(':').map(Number);
      if (!groupedByRow[row]) groupedByRow[row] = [];
      groupedByRow[row].push(player);
    });
    
    const sortedRowKeys = Object.keys(groupedByRow).map(Number).sort((a, b) => a - b);
    const totalRows = sortedRowKeys.length;
    const positionedPlayers = [];
    const playableHeight = 38;
    const homeStart = 8;
    const awayStart = 92;

    sortedRowKeys.forEach((rowKey, index) => {
      const playersInLine = groupedByRow[rowKey];
      let y = isTop
        ? homeStart + (index / (totalRows > 1 ? totalRows - 1 : 1)) * playableHeight
        : awayStart - (index / (totalRows > 1 ? totalRows - 1 : 1)) * playableHeight;
      playersInLine.forEach((player, playerIndex) => {
        const x = (100 / (playersInLine.length + 1)) * (playerIndex + 1);
        positionedPlayers.push({ ...player, x, y });
      });
    });
    return positionedPlayers;
  };

  const SubstitutesList = ({ lineup }) => (
    <div className="substitutes-list">
      <div className="substitutes-header">
        <img src={lineup.team.logo} alt={lineup.team.name} />
        <h3>{lineup.team.name} - Substitutes</h3>
      </div>
      <div className="substitutes-body">
        {lineup.substitutes.map(({ player }) => (
          <div key={player.id} className="substitute-row">
            <span className="sub-number">{player.number}</span>
            <span className="sub-name">{player.name}</span>
            {subbedInPlayerIds.has(player.id) && <EventIcon event={{ type: 'sub_in' }} />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        /* --- Lineup Specific Styles --- */
        :root { --section-bg: #2C2C2C; --pitch-dark: #0A2A12; --pitch-light: #1A4A28; --line-color: #3A6A48; --text-primary: #E0E0E0; --text-secondary: #B0B0B0; }
        .lineups-section { font-family: 'Inter', sans-serif; background: var(--section-bg); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; color: var(--text-primary); }
        .lineups-title { text-align: center; font-size: 2 rem; font-weight: 600; margin-bottom: 3rem;color: white }
        .lineup-layout { display: flex; align-items: stretch; justify-content: center; gap: 2rem; }
        .pitch-area { position: relative; width: 100%; max-width: 550px; flex-shrink: 0; height: 850px; background: radial-gradient(circle at center, var(--pitch-light) 0%, var(--pitch-dark) 90%); border: 3px solid var(--line-color); border-radius: 12px; box-shadow: inset 0 0 25px rgba(0,0,0,0.6); }
        .team-formation-label { position: absolute; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.75); border: 2px solid var(--line-color); border-radius: 8px; padding: 8px 16px; font-weight: 700; color: #fff; z-index: 10; white-space: nowrap; }
        .player-container { position: absolute; transform: translate(-50%, -50%); width: 80px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .player-jersey-wrapper { position: relative; width: 44px; height: 44px; }
        .player-jersey { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 50%; font-weight: 700; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(0,0,0,0.5); }
        .player-name-plate { font-size: 0.8rem; color: var(--text-primary); background: rgba(0,0,0,0.7); padding: 2px 7px; border-radius: 4px; white-space: nowrap; text-shadow: 0 1px 2px #000; }
        .substitutes-list { flex: 1 1 250px; min-width: 250px; }
        .substitutes-header { display: flex; align-items: center; gap: 12px; margin-bottom: 0.75rem; padding: 0.7rem; background: #383838; border-radius: 8px; }
        .substitutes-header img { width: 32px; height: 32px; object-fit: contain; }
        .substitutes-header h3 { font-size: 1.1rem; color: var(--text-primary); margin: 0; font-weight: 500; }
        .substitutes-body { background: #333333; border-radius: 8px; padding: 10px; height: calc(100% - 72px); max-height: 720px; overflow-y: auto; }
        .substitute-row { display: flex; align-items: center; padding: 10px 5px; font-size: 0.9rem; border-bottom: 1px solid #4a4a4a; }
        .sub-number { color: var(--text-secondary); width: 30px; text-align: center; }
        .sub-name { color: var(--text-primary); flex: 1; }
        .status-text { text-align: center; font-size: 1.1rem; padding: 2rem 0; color: var(--text-secondary); }
        .status-text.error { color: #e53e3e; }
        @media (max-width: 1200px) { .lineup-layout { gap: 1.5rem; } }
        @media (max-width: 1024px) {
          .lineup-layout { flex-direction: column; align-items: center; gap: 0; }
          .desktop-subs { display: none; }
          .pitch-area { margin-bottom: 4rem !important; }
          .mobile-subs-container { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 550px; }
        }
        @media (min-width: 1025px) { .mobile-subs-container { display: none; } }
        @media (max-width: 768px) {
          .pitch-area { height: 600px !important; } 
          .player-jersey-wrapper { width: 34px; height: 34px; } 
          .player-jersey { font-size: 0.7rem; } 
          .player-name-plate { font-size: 0.65rem; padding: 2px 5px; } 
        }
      `}</style>
      <div className="lineups-section">
        <h2 className="lineups-title">Match Lineups</h2>
        <div className="lineup-layout">
          <div className="desktop-subs"><SubstitutesList lineup={homeLineup} /></div>
          <div className="pitch-area">
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '3px', background: 'var(--line-color)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '120px', height: '120px', border: '3px solid var(--line-color)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
            <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '140px', border: '3px solid var(--line-color)', borderTop: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: '35%', width: '30%', height: '50px', border: '3px solid var(--line-color)', borderTop: 'none' }} />
            <div style={{ position: 'absolute', top: '140px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '40px', border: '3px solid var(--line-color)', borderTop: 'none', borderRadius: '0 0 50% 50%' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '60%', height: '140px', border: '3px solid var(--line-color)', borderBottom: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '35%', width: '30%', height: '50px', border: '3px solid var(--line-color)', borderBottom: 'none' }} />
            <div style={{ position: 'absolute', bottom: '140px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '40px', border: '3px solid var(--line-color)', borderBottom: 'none', borderRadius: '50% 50% 0 0' }} />
            
            {[{ lineup: homeLineup, side: 'top' }, { lineup: awayLineup, side: 'bottom' }].map(({ lineup, side }) => (
              <React.Fragment key={lineup.team.id}>
                {calculatePlayerPositions(lineup, side === 'top').map((player) => {
                  const colors = player.pos === 'G' ? lineup.team.colors.goalkeeper : lineup.team.colors.player;
                  const eventsForPlayer = playerEvents.get(player.id) || [];
                  return (
                    <div key={player.id} className="player-container" style={{ top: `${player.y}%`, left: `${player.x}%` }}>
                      <div className="player-jersey-wrapper">
                        <div className="player-jersey" style={{ backgroundColor: `#${colors.primary}`, border: `2px solid #${colors.border}`, color: `#${colors.number}` }}>{player.number}</div>
                        {eventsForPlayer.map((event, index) => <EventIcon key={index} event={event} />)}
                      </div>
                      <div className="player-name-plate">{player.name.split(' ').slice(-1).join(' ')}</div>
                    </div>
                  );
                })}
                <div className="team-formation-label" style={side === 'top' ? { top: '-45px' } : { bottom: '-45px' }}>
                  {lineup.team.name} <span style={{ opacity: 0.8, fontWeight: 400 }}>({lineup.formation})</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="desktop-subs"><SubstitutesList lineup={awayLineup} /></div>
        </div>
        <div className="mobile-subs-container">
          <SubstitutesList lineup={homeLineup} />
          <SubstitutesList lineup={awayLineup} />
        </div>
      </div>
    </>
  );
};

export default Lineup;