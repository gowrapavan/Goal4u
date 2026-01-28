import React, { useState, useEffect } from 'react';

const STANDINGS_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/standing/';
const MATCHES_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/';

// --- Helper for Form Bubbles ---
const FormIndicator = ({ result }) => {
    const bgColor = result === 'W' ? '#10b981' : result === 'D' ? '#6b7280' : '#ef4444';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '20px', height: '20px', borderRadius: '4px',
            backgroundColor: bgColor, color: '#fff', fontSize: '11px', fontWeight: '700',
            margin: '0 2px'
        }}>
            {result}
        </span>
    );
};

const Table = ({ competition }) => {
    const [allStandings, setAllStandings] = useState([]);
    const [formStandings, setFormStandings] = useState([]);
    const [activeView, setActiveView] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!competition) {
            setError('Competition not specified.');
            setLoading(false);
            return;
        }

        const calculateForm = (matches, standings) => {
             return standings.map(teamData => {
                const team = teamData.team;
                const teamMatches = matches
                    .filter(m => (m.HomeTeamId === team.id || m.AwayTeamId === team.id) && m.Status === 'Final')
                    .sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime())
                    .slice(0, 5);

                const form = teamMatches.map(m => {
                    if (m.HomeTeamScore === m.AwayTeamScore) return 'D';
                    if (m.HomeTeamId === team.id) return m.HomeTeamScore > m.AwayTeamScore ? 'W' : 'L';
                    return m.AwayTeamScore > m.HomeTeamScore ? 'W' : 'L';
                }).reverse();
                
                return { ...teamData, form };
            });
        };

        const fetchAndProcessData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [standingsRes, matchesRes] = await Promise.all([
                    fetch(`${STANDINGS_BASE_URL}${competition.toUpperCase()}.json`),
                    fetch(`${MATCHES_BASE_URL}${competition.toUpperCase()}.json`)
                ]);

                if (!standingsRes.ok) throw new Error(`Data unavailable.`);
                
                const standingsJson = await standingsRes.json();
                const matches = matchesRes.ok ? await matchesRes.json() : [];

                const totalStandings = standingsJson.standings.find(s => s.type === 'TOTAL')?.table || [];
                setAllStandings(totalStandings);

                if (matches.length > 0 && totalStandings.length > 0) {
                    const form = calculateForm(matches, totalStandings);
                    setFormStandings(form);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessData();
    }, [competition]);

    const dataToDisplay = activeView === 'Form' ? formStandings : allStandings;

    if (loading) return <div className="st-msg">Loading Table...</div>;
    if (error) return <div className="st-msg error">{error}</div>;

    return (
        <div className="st-wrapper">
            <style>{`
                .st-wrapper {
                    font-family: 'Inter', sans-serif;
                    background-color: #1a1a1a;
                    border-radius: 12px;
                    padding: 20px;
                    max-width: 900px;
                    margin: 0 auto;
                }
                .st-msg { text-align: center; color: #888; padding: 2rem; }
                .st-msg.error { color: #ff6b6b; }

                /* Controls */
                .st-controls { display: flex; gap: 8px; margin-bottom: 16px; }
                .st-btn {
                    background: #2a2a2a; border: 1px solid #333; color: #aaa;
                    padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                }
                .st-btn:hover { color: #fff; background: #333; }
                .st-btn.active { background: #fff; color: #000; border-color: #fff; }

                /* Table */
                .st-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                
                .st-table th {
                    text-align: center; color: #888; font-weight: 500; font-size: 12px;
                    padding: 10px 6px; border-bottom: 1px solid #333;
                }
                .st-table th:nth-child(2) { text-align: left; } /* Team Column */
                
                .st-table td {
                    text-align: center; color: #ddd; padding: 12px 6px;
                    border-bottom: 1px solid #252525;
                }
                .st-table tr:last-child td { border-bottom: none; }
                
                .st-rank { color: #666; font-size: 13px; width: 40px; }
                .st-team-flex { display: flex; align-items: center; gap: 10px; }
                .st-logo { width: 24px; height: 24px; object-fit: contain; }
                .st-team-name { font-weight: 600; color: #fff; }
                
                .st-pts { font-weight: 700; color: #fff; background: #2a2a2a; border-radius: 4px; padding: 2px 6px; }
                .st-form-cell { text-align: right !important; padding-right: 10px; }

                @media(max-width: 600px) {
                    .st-wrapper { padding: 10px; border-radius: 0; background: transparent; }
                    .st-table { font-size: 12px; }
                    .st-logo { width: 20px; height: 20px; }
                    .st-table th, .st-table td { padding: 8px 2px; }
                    .st-hide-mobile { display: none; }
                }
            `}</style>
            
            <div className="st-controls">
                <button className={`st-btn ${activeView === 'All' ? 'active' : ''}`} onClick={() => setActiveView('All')}>ALL</button>
                <button className={`st-btn ${activeView === 'Form' ? 'active' : ''}`} onClick={() => setActiveView('Form')}>FORM</button>
            </div>

            <table className="st-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th style={{ width: '40%' }}>Team</th>
                        {activeView !== 'Form' ? (
                            <>
                                <th>MP</th>
                                <th className="st-hide-mobile">W</th>
                                <th className="st-hide-mobile">D</th>
                                <th className="st-hide-mobile">L</th>
                                <th>GD</th>
                                <th>Pts</th>
                            </>
                        ) : (
                            <th className="st-form-cell">Last 5 Matches</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {dataToDisplay.map((row) => (
                        <tr key={row.team.id}>
                            <td className="st-rank">{row.position}</td>
                            <td>
                                <div className="st-team-flex">
                                    <img src={row.team.crest} alt={row.team.tla} className="st-logo"/>
                                    <span className="st-team-name">{row.team.shortName || row.team.name}</span>
                                </div>
                            </td>
                            {activeView !== 'Form' ? (
                                <>
                                    <td>{row.playedGames}</td>
                                    <td className="st-hide-mobile">{row.won}</td>
                                    <td className="st-hide-mobile">{row.draw}</td>
                                    <td className="st-hide-mobile">{row.lost}</td>
                                    <td style={{ color: row.goalDifference > 0 ? '#10b981' : row.goalDifference < 0 ? '#ef4444' : '#888' }}>
                                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </td>
                                    <td><span className="st-pts">{row.points}</span></td>
                                </>
                            ) : (
                                <td className="st-form-cell">
                                    {row.form && row.form.map((res, i) => <FormIndicator key={i} result={res} />)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;