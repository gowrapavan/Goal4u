import React, { useState, useEffect } from 'react';

const STANDINGS_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/standing/';
const MATCHES_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/';

// --- Helper Component for W/D/L bubbles in Form view ---
const FormIndicator_stcomp = ({ result }) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '0.75rem',
    };
    const styles = {
        W: { ...baseStyle, backgroundColor: '#28a745' }, // Green for Win
        D: { ...baseStyle, backgroundColor: '#6c757d' }, // Grey for Draw
        L: { ...baseStyle, backgroundColor: '#dc3545' }, // Red for Loss
    };
    return <span style={styles[result]}>{result}</span>;
};

// --- RankIndicator_stcomp component removed ---


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

                if (!standingsRes.ok) {
                    throw new Error(`Table data not available for this competition.`);
                }
                
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

    // Use the new unique class names in the loading/error states
    if (loading) return <div className="table-wrapper_stcomp status-text_stcomp">Loading Table...</div>;
    if (error) return <div className="table-wrapper_stcomp status-text_stcomp error_stcomp">{error}</div>;

    return (
        // All class names in the JSX have been updated with the _stcomp suffix
        <div className="table-wrapper_stcomp">
            <style>{`
                /* Main container */
                .table-wrapper_stcomp {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
                    background-color: #1d1d1d;
                    color: #e0e0e0;
                    padding: 1rem;
                    border-radius: 12px;
                    max-width: 1024px;
                    margin: 1rem auto;
                    /* --- FIX: Removed outer border --- */
                    border: 1px solid transparent !important;
                }
                
                /* Loading/Error messages */
                .status-text_stcomp { text-align: center; font-size: 1.1rem; padding: 2rem 0; color: #888; }
                .status-text_stcomp.error_stcomp { color: #ff4d4d; }

                /* Control Buttons */
                .table-controls_stcomp { display: flex; justify-content: flex-start; gap: 0.5rem; margin-bottom: 1rem; }
                .control-button_stcomp {
                    background-color: #333;
                    border: none;
                    color: #ccc;
                    padding: 6px 16px;
                    border-radius: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.85rem;
                }
                .control-button_stcomp:hover { background-color: #444; color: #fff; }
                .control-button_stcomp.active { background-color: #fff; color: #000; }

                /* Table General Styles */
                .styled-table_stcomp {
                    width: 100%;
                    border-collapse: collapse; /* This removes vertical column lines */
                    background-color: transparent;
                }

                /* Table Header */
                .styled-table_stcomp thead tr {
                    font-weight: 500;
                    font-size: 0.8rem;
                }
                .styled-table_stcomp th {
                    /* --- FIX: Color applied directly to TH and forced --- */
                    color: #ddd !important;
                    padding: 12px 10px;
                    text-align: center;
                    /* --- FIX: Re-added faint line under header to match image --- */
                    border-bottom: 1px solid #333 !important;
                    /* Force remove column lines */
                    border-left: none !important;
                    border-right: none !important;
                }
                .styled-table_stcomp th:first-child, .styled-table_stcomp th:nth-child(2) {
                    text-align: left;
                }
                
                /* Table Body */
                .styled-table_stcomp tbody tr {
                    /* --- FIX: Fainter row border (KEPT) --- */
                    border-bottom: 1px solid #2a2a2a !important; 
                    transition: background-color 0.2s ease;
                }
                .styled-table_stcomp tbody tr:last-child { 
                    /* Remove the border from the very last row */
                    border-bottom: none !important; 
                }
                .styled-table_stcomp tbody tr:hover { background-color: #252525; }

                .styled-table_stcomp td {
                    padding: 14px 10px;
                    text-align: center;
                    vertical-align: middle;
                    font-size: 0.9rem;
                    /* --- FIX: Lighter text for data cells --- */
                    color: #e0e0e0;
                    /* Force remove column lines */
                    border-left: none !important;
                    border-right: none !important;
                }

                /* Specific Cell Overrides */
                .styled-table_stcomp td:first-child, .styled-table_stcomp td:nth-child(2) {
                    text-align: left;
                }
                
                /* --- Restored simple Rank Cell style --- */
                .rank-cell_stcomp { 
                    font-weight: 500; 
                    color: #888;
                }
                
                /* --- Rank Indicator Bar Styles REMOVED --- */


                .team-cell_stcomp { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; color: #e0e0e0; }
                .team-logo_stcomp { 
                    width: 24px; 
                    height: 24px; 
                    object-fit: contain; 
                    /* Explicitly remove any border */
                    border: 0;
                    background: transparent;
                }
                .points-cell_stcomp { font-weight: 700; color: #fff; }
                .form-cell_stcomp { display: flex; justify-content: flex-end; gap: 4px; padding-right: 1rem; }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .table-wrapper_stcomp { padding: 0.5rem; }
                    .styled-table_stcomp th, .styled-table_stcomp td { padding: 10px 4px; font-size: 0.8rem; }
                    .team-cell_stcomp { gap: 0.5rem; }
                    .team-logo_stcomp { width: 20px; height: 20px; }

                    /* --- FIX: Added row border rules for mobile --- */
                    .styled-table_stcomp tbody tr {
                        border-bottom: 1px solid #2a2a2a !important; 
                    }
                    .styled-table_stcomp tbody tr:last-child { 
                        border-bottom: none !important; 
                    }
                }
            `}</style>
            
            <div className="table-controls_stcomp">
                {['All', 'Form'].map(view => (
                    <button 
                        key={view} 
                        onClick={() => setActiveView(view)} 
                        className={`control-button_stcomp ${activeView === view ? 'active' : ''}`}
                    >
                        {view.toUpperCase()}
                    </button>
                ))}
            </div>

            <table className="styled-table_stcomp">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Team</th>
                        {activeView !== 'Form' ? (
                            <>
                                <th>P</th><th>W</th><th>D</th><th>L</th><th>F</th><th>A</th><th>GD</th><th>Pts</th>
                            </>
                        ) : (
                            <th style={{ textAlign: 'right' }}>FORM</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {dataToDisplay.map((row) => (
                        <tr key={row.team.id}>
                            {/* --- Restored simple rank cell --- */}
                            <td className="rank-cell_stcomp">{row.position}</td>
                            
                            <td>
                                <div className="team-cell_stcomp">
                                    {/* --- FIX: Updated alt text --- */}
                                    <img src={row.team.crest} alt={row.team.shortName} className="team-logo_stcomp"/>
                                    <span>{row.team.name}</span>
                                </div>
                            </td>
                            {activeView !== 'Form' ? (
                                <>
                                    <td>{row.playedGames}</td>
                                    <td>{row.won}</td>
                                    <td>{row.draw}</td>
                                    <td>{row.lost}</td>
                                    <td>{row.goalsFor}</td>
                                    <td>{row.goalsAgainst}</td>
                                    <td>{row.goalDifference}</td>
                                    <td className="points-cell_stcomp">{row.points}</td>
                                </>
                            ) : (
                                <td className="form-cell_stcomp">
                                    {/* --- FIX: Corrected typo (removed 't') --- */}
                                    {row.form && row.form.map((res, i) => <FormIndicator_stcomp key={i} result={res} />)}
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

