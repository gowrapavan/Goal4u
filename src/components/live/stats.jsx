import React, { useEffect, useState } from 'react';

const STATS_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/stats/';

const Stats = ({ matchId, competition }) => {
  const [matchStats, setMatchStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId || !competition) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      setMatchStats(null);

      try {
        const compFile = `${competition?.toUpperCase()}.json`;
        const res = await fetch(`${STATS_BASE_URL}${compFile}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const stats = data.find(m => String(m.GameId) === String(matchId));
        if (!stats) {
          setError('Stats not found for this match.');
        } else {
          setMatchStats(stats);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [matchId, competition]);

  if (loading) return <p style={{ color: '#aaa' }}>Loading statistics…</p>;
  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!matchStats) return null;

  const { HomeTeam, AwayTeam, Score, Lineups, Events, Statistics, Status, Round, Date: matchDate } = matchStats;

  const homeLineup = Lineups?.[0];
  const awayLineup = Lineups?.[1];
  const maxPlayers = Math.max(homeLineup?.startXI.length ?? 0, awayLineup?.startXI.length ?? 0);

  return (
    <div style={{
      background: '#1f1f2e',
      padding: '1rem',
      borderRadius: '15px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
      marginTop: '1rem',
      color: '#e0e0e0',
      fontFamily: "'Inter', sans-serif",
      fontSize: 'clamp(12px, 2vw, 16px)' // ✅ responsive text
    }}>
      {/* Match Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {homeLineup && (
          <div style={{ textAlign: 'center', flex: '1 1 100px' }}>
            <img src={homeLineup.team.logo} alt={HomeTeam} style={{ width: 'clamp(40px, 12vw, 70px)', height: 'auto', objectFit: 'contain' }} />
            <div>{HomeTeam}</div>
          </div>
        )}
        <div style={{ fontSize: 'clamp(1.5rem, 6vw, 2em)', fontWeight: 'bold', margin: '0 1rem', color: '#0cb154' }}>
          {Score?.Home ?? '-'} : {Score?.Away ?? '-'}
        </div>
        {awayLineup && (
          <div style={{ textAlign: 'center', flex: '1 1 100px' }}>
            <img src={awayLineup.team.logo} alt={AwayTeam} style={{ width: 'clamp(40px, 12vw, 70px)', height: 'auto', objectFit: 'contain' }} />
            <div>{AwayTeam}</div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem', fontStyle: 'italic', color: '#94a3b8' }}>
        Status: {Status} | Round: {Round} | Date: {new Date(matchDate).toLocaleString()}
      </div>

      {/* Lineups side-by-side */}
      {homeLineup && awayLineup && (
        <div style={{ marginBottom: '2rem', overflowX: 'auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '0.75rem', color: '#f5f5f5' }}>Lineups</h3>
          <table style={{ width: '100%', minWidth: '300px', borderCollapse: 'collapse', background: '#2c2c3c', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #444' }}>
                <th>{HomeTeam}</th>
                <th>{AwayTeam}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'center', padding: '5px' }}>Coach: {homeLineup.coach?.name ?? '-'}</td>
                <td style={{ textAlign: 'center', padding: '5px' }}>Coach: {awayLineup.coach?.name ?? '-'}</td>
              </tr>
              {Array.from({ length: maxPlayers }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ textAlign: 'center', padding: '5px' }}>{homeLineup.startXI[idx]?.player.name ?? '-'}</td>
                  <td style={{ textAlign: 'center', padding: '5px' }}>{awayLineup.startXI[idx]?.player.name ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Match Events */}
      {Events?.length > 0 && (
        <div style={{ marginBottom: '2rem', overflowX: 'auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#f5f5f5' }}>Match Events</h3>
          <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', background: '#2c2c3c', color: '#e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #444' }}>
                <th>Minute</th>
                <th>Team</th>
                <th>Player</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {Events.map((e, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #444' }}>
                  <td>{e.time?.elapsed ?? ''}'</td>
<td>
  {e.team?.logo ? (
    <img 
      src={e.team.logo} 
      alt={e.team?.name ?? 'Team'} 
      style={{ width: '24px', height: '24px',border: 'none' }} 
    />
  ) : ''}
</td>
                  <td>{e.player?.name ?? ''}</td>
                  <td>{e.type ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      {Statistics?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#f5f5f5' }}>Match Statistics</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '20px' }}>
            {Statistics.map(statTeam => (
              <div key={statTeam.team.id} style={{
                flex: '1 1 250px',
                background: '#2c2c3c',
                padding: '15px',
                borderRadius: '10px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                minWidth: '200px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <img src={statTeam.team.logo} alt={statTeam.team.name} style={{ width: 'clamp(25px, 8vw, 40px)', height: 'auto', objectFit: 'contain' }} />
                  <strong style={{ color: '#f5f5f5' }}>{statTeam.team.name}</strong>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse',background: '#2c2c3c'  }}>
                  <tbody>
                    {statTeam.statistics.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #444' }}>
                        <td style={{ textAlign: 'left', padding: '5px' }}>{s.type}</td>
                        <td style={{ textAlign: 'right', padding: '5px' }}>{s.value ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
