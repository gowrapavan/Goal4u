import { useEffect, useState, useRef } from "react";

export default function HighlightsSection() {
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const playerRef = useRef(null);
  const sidebarRef = useRef(null); 

  const DATA_URL = "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/Highlights/Highlight.json";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(DATA_URL, { cache: "no-store" });
        const data = await res.json();
        setMatches(data);
        setActive(data[0] || null);
      } catch (err) {
        console.error("Failed to load highlights:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- HEIGHT SYNC LOGIC ---
  useEffect(() => {
    const videoEl = playerRef.current;
    const sidebarEl = sidebarRef.current;

    if (!videoEl || !sidebarEl) return;

    const syncHeight = () => {
      if (window.innerWidth > 900) {
        const height = videoEl.offsetHeight;
        if (height > 0) {
          sidebarEl.style.height = `${height}px`;
          sidebarEl.style.maxHeight = `${height}px`;
        }
      } else {
        sidebarEl.style.height = 'auto';
        sidebarEl.style.maxHeight = 'none';
      }
    };

    const observer = new ResizeObserver(syncHeight);
    observer.observe(videoEl);
    window.addEventListener("resize", syncHeight);

    syncHeight(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, [loading, active]);

  if (loading || !active) return null;

  return (
    <div className="highlightsSectionWrapper">
      <div className="highlightsInner">
        
        {/* HEADER */}
        <div className="sectionHeaderTop">
          <h1 className="mainHeading">MATCH HIGHLIGHTS</h1>
          <p className="subHeading">Watch the latest football action and top goals</p>
        </div>

        {/* INFO BAR - UPDATED WITH LOGOS */}
        <div className="activeMatchInfoBar">
          <div className="infoBarTop">
            <div className="titleWithLogos">
                {/* Home Logo */}
                <img 
                    src={active.home_logo} 
                    alt="Home" 
                    className="headerLogo" 
                    onError={(e) => e.target.style.display='none'}
                />
                
                {/* Title */}
                <h2 className="activeMatchTitle">{active.title}</h2>
                
                {/* Away Logo */}
                <img 
                    src={active.away_logo} 
                    alt="Away" 
                    className="headerLogo" 
                    onError={(e) => e.target.style.display='none'}
                />
            </div>
            <span className="activeMatchDate">{active.date}</span>
          </div>
          
          <div className="infoBarBottom">
            <span className="infoBadge league">{active.league || "Featured Match"}</span>
            <span className="infoBadge highlights">Highlights</span>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="highlightsMainLayout">
          
          {/* LEFT: Video Player */}
          <div className="videoSection">
            <div className="videoPlayerWrapper" ref={playerRef}>
              <div className="iframeContainer">
                <iframe
                  key={active.id}
                  src={active.embed_url}
                  title={active.title}
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  referrerPolicy="no-referrer"
                  allow="fullscreen; encrypted-media"
                  className="iframeStream"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar List */}
          <div className="selectionSection" ref={sidebarRef}>
            <div className="selectionHeader">
              <h3>Recent Matches</h3>
            </div>
            
            <div className="matchList">
              {matches.map((m) => {
                const isActiveMatch = active.id === m.id;
                return (
                  <div
                    key={m.id}
                    className={`matchRow ${isActiveMatch ? "activeRow" : ""}`}
                    onClick={() => setActive(m)}
                  >
                    <div className="rowLogos">
                      <div className="logoWrap">
                        <img src={m.home_logo} alt="" onError={(e)=>e.target.style.opacity=0} />
                      </div>
                      <div className="logoWrap">
                        <img src={m.away_logo} alt="" onError={(e)=>e.target.style.opacity=0} />
                      </div>
                    </div>
                    
                    <div className="rowInfo">
                      <strong className="rowTitle">{m.title}</strong>
                      <div className="rowSubInfo">
                        <span className="rowDate">{m.date}</span>
                        {m.HomeTeamScore !== undefined && (
                          <span className="rowScore">
                            {m.HomeTeamScore} - {m.AwayTeamScore}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rowStatus">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="playIcon">
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                       </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        :root {
          --primary: #00a94e;
          --bg: #f8f9fa;
          --card: #ffffff;
          --border: #e9ecef;
          --text: #2d3436;
          --muted: #636e72;
        }

        .highlightsSectionWrapper {
          padding: 2rem 1.5rem;
          background: var(--bg);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .highlightsInner {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* --- HEADER --- */
        .sectionHeaderTop {
          margin-bottom: 24px;
          border-left: 5px solid var(--primary);
          padding-left: 15px;
        }
        .mainHeading {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.5px;
        }
        .subHeading {
          font-size: 14px;
          color: var(--muted);
          margin: 4px 0 0 0;
        }

        /* --- INFO BAR --- */
        .activeMatchInfoBar {
          background: var(--card); /* Unified Background */
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 15px 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .infoBarTop {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        /* Title with Logos Styles */
        .titleWithLogos {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .headerLogo {
            width: 32px;
            height: 32px;
            object-fit: contain;
        }

        .activeMatchTitle {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
        }

        .activeMatchDate {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          margin-left: 2px;
        }

        .infoBarBottom {
          display: flex;
          gap: 10px;
        }
        .infoBadge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .infoBadge.league { background: #f1f3f5; color: var(--text); border: 1px solid var(--border); }
        .infoBadge.highlights { background: #e9f7ef; color: var(--primary); border: 1px solid #d4edda; }

        /* --- MAIN LAYOUT --- */
        .highlightsMainLayout {
          display: grid;
          grid-template-columns: 1fr 360px; 
          gap: 20px;
          align-items: start;
        }

        /* --- VIDEO PLAYER --- */
        .videoSection { 
            flex: 1; 
            min-width: 0; 
        }
        .videoPlayerWrapper { 
          width: 100%; 
          aspect-ratio: 16/9; 
          background: #000; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
        }
        .iframeContainer { width: 100%; height: 100%; }
        .iframeStream { width: 100%; height: 100%; border: none; display: block; }

        /* --- SIDEBAR --- */
        .selectionSection {
          background: var(--card); /* Unified Background */
          border-radius: 12px; 
          border: 1px solid var(--border);
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
        }

        .selectionHeader { 
          padding: 14px 16px; 
          background: var(--card); /* Unified Background (Removed gray) */
          border-bottom: 1px solid var(--border); 
          flex-shrink: 0; 
        }
        .selectionHeader h3 { 
          margin: 0; 
          font-size: 12px; 
          color: var(--muted); 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
          font-weight: 700; 
        }

        .matchList { 
            flex: 1; 
            overflow-y: auto; 
            background: var(--card); /* Unified Background */
        }
        .matchList::-webkit-scrollbar { width: 6px; }
        .matchList::-webkit-scrollbar-track { background: transparent; }
        .matchList::-webkit-scrollbar-thumb { background-color: #dee2e6; border-radius: 20px; }

        /* Match Rows */
        .matchRow { 
          display: flex; 
          align-items: center; 
          padding: 12px 16px; 
          border-bottom: 1px solid #f1f3f5; 
          cursor: pointer; 
          transition: background 0.1s; 
          position: relative;
        }
        .matchRow:hover { background: #f8f9fa; }
        
        .activeRow { 
          background: #f0fdf4; /* Light green tint for active */
        }
        .activeRow::before {
            content: '';
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 4px;
            background: var(--primary);
        }

        .rowLogos { 
            display: flex; 
            flex-direction: column; 
            gap: 4px; 
            margin-right: 14px; 
            width: 24px; 
            align-items: center;
        }
        .logoWrap { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
        .logoWrap img { max-width: 100%; max-height: 100%; object-fit: contain; }

        .rowInfo { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .rowTitle { 
            font-size: 13px; 
            font-weight: 600; 
            color: var(--text); 
            line-height: 1.3; 
        }
        
        .rowSubInfo { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .rowDate { font-size: 11px; color: var(--muted); }
        
        .rowScore { 
          font-size: 11px; 
          font-weight: 700; 
          color: var(--primary); 
          background: #ecfdf5; 
          padding: 1px 6px; 
          border-radius: 4px; 
          border: 1px solid #a7f3d0; 
          letter-spacing: 0.5px;
        }

        .rowStatus { 
            color: var(--muted); 
            opacity: 0;
            transition: opacity 0.2s;
        }
        .matchRow:hover .rowStatus, .activeRow .rowStatus { opacity: 1; }
        .playIcon { width: 16px; height: 16px; fill: var(--primary); }

        /* --- MOBILE --- */
        @media (max-width: 900px) {
          .highlightsSectionWrapper { padding: 1rem; }
          .highlightsMainLayout { grid-template-columns: 1fr; gap: 15px; }
          
          .selectionSection { 
              height: auto !important; 
              max-height: none !important; 
          }
          
          .matchList { 
              display: flex; 
              overflow-x: auto; 
              overflow-y: hidden;
              padding-bottom: 10px;
          }
          
          .matchRow { 
              min-width: 200px; 
              border: 1px solid var(--border); 
              border-radius: 8px; 
              margin-right: 10px; 
              flex-direction: row; 
              height: auto;
          }
          .activeRow { border-color: var(--primary); }
          .activeRow::before { display: none; }

          .titleWithLogos {
              gap: 8px;
          }
          .activeMatchTitle {
              font-size: 1.1rem;
          }
          .headerLogo {
              width: 24px;
              height: 24px;
          }
        }
      `}</style>
    </div>
  );
}