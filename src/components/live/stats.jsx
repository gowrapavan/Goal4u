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
      try {
        const res = await fetch(`${STATS_BASE_URL}${competition.toUpperCase()}.json`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const stats = data.find(m => String(m.GameId) === String(matchId));
        setMatchStats(stats || null);
        if (!stats) setError('Stats not found for this match.');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [matchId, competition]);

  if (loading) return <div className="stats-wrapper"><p className="status-text">Loading statistics…</p></div>;
  if (error) return <div className="stats-wrapper"><p className="status-text error">{error}</p></div>;
  if (!matchStats) return null;

  const { HomeTeam, AwayTeam, Score, Lineups, Statistics, Status, Round, Date: matchDate } = matchStats;
  const homeLineup = Lineups?.[0];
  const awayLineup = Lineups?.[1];

  return (
    <>
      <style>{`
        /* --- Stats Specific Styles --- */
        :root { --dark-bg: #1A1A1A; --primary-green: #2E8B57; --text-primary: #E0E0E0; --text-secondary: #B0B0B0; }
        .stats-wrapper { font-family: 'Inter', sans-serif; background: var(--dark-bg); color: var(--text-primary); padding: 1.5rem; border-radius: 20px; margin: 1rem auto; max-width: 1600px; }
        .status-text { text-align: center; font-size: 1.1rem; padding: 2rem 0; color: var(--text-secondary); }
        .status-text.error { color: #e53e3e; }
        .match-header-pro { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .team-display-pro { text-align: center; flex: 1; }
        .team-display-pro img { width: 80px; height: 80px; object-fit: contain; margin-bottom: 0.5rem; }
        .team-display-pro div { font-weight: 500; font-size: 1.2rem; }
        .match-score-pro { font-size: 3rem; font-weight: 700; color: var(--primary-green); margin: 0 2rem; }
        .match-details-pro { text-align: center; margin-bottom: 2.5rem; color: var(--text-secondary); font-size: 0.9rem; }
        .stats-section-pro { padding-top: 2rem; }
        .stats-title-pro { text-align: center; font-size: 1.6rem; font-weight: 500; margin-bottom: 1.5rem; }
        .stats-comparison { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .stats-label { text-align: center; color: var(--text-secondary); font-weight: 500; }
        .stats-value { font-weight: bold; font-size: 1.1rem; }
        .stats-bar-container { background: #4a4a4a; height: 10px; border-radius: 5px; overflow: hidden; display: flex; grid-column: 1 / -1; }
        .stats-bar-home { background: var(--primary-green); height: 100%; border-radius: 5px 0 0 5px; }
        .stats-bar-away { background: #e53e3e; height: 100%; border-radius: 0 5px 5px 0; }
        @media (max-width: 768px) {
          .stats-wrapper { padding: 1rem; }
          .team-display-pro img { width: 50px; height: 50px; }
          .match-score-pro { font-size: 2rem; }
        }
      `}</style>
      
      <div className="stats-wrapper">
        <div className="match-header-pro">
          <div className="team-display-pro">
            <img src={homeLineup?.team.logo} alt={HomeTeam} />
            <div>{HomeTeam}</div>
          </div>
          <div className="match-score-pro">{Score?.Home ?? '-'} : {Score?.Away ?? '-'}</div>
          <div className="team-display-pro">
            <img src={awayLineup?.team.logo} alt={AwayTeam} />
            <div>{AwayTeam}</div>
          </div>
        </div>

        <div className="match-details-pro">
          Status: {Status} | Round: {Round} | Date: {new Date(matchDate).toLocaleDateString()}
        </div>
        
        {Statistics?.length > 1 && (
            <div className="stats-section-pro">
                <h2 className="stats-title-pro">Match Statistics</h2>
                {Statistics[0].statistics.map((stat, index) => {
                    const homeValue = Statistics[0].statistics[index]?.value ?? 0;
                    const awayValue = Statistics[1].statistics[index]?.value ?? 0;
                    const total = (Number(String(homeValue).replace('%','')) || 0) + (Number(String(awayValue).replace('%','')) || 0);
                    const homeWidth = total > 0 ? ((Number(String(homeValue).replace('%','')) || 0) / total) * 100 : 50;
                    return (
                        <div key={index} className="stats-comparison">
                            <div className="stats-value" style={{ textAlign: 'right' }}>{homeValue}</div>
                            <div className="stats-label">{stat.type}</div>
                            <div className="stats-value" style={{ textAlign: 'left' }}>{awayValue}</div>
                            <div className="stats-bar-container">
                                <div className="stats-bar-home" style={{ width: `${homeWidth}%` }}></div>
                                <div className="stats-bar-away" style={{ width: `${100 - homeWidth}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </>
  );
};

export default Stats;