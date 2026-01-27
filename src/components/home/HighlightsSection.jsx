import { useEffect, useState } from "react";

export default function HighlightsSection() {
  const [matches, setMatches] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const DATA_URL =
    "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/Highlights/hoofoot.json";

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

  if (loading || !active) return null;

  return (
    <div className="highlightsSectionWrapper">
      <div className="highlightsInner">

        {/* Main Highlight Card */}
        <div className="video-card">
          <div className="video-frame">
            <iframe
              key={active.id}
              src={active.embed_url}
              title={active.title}
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="no-referrer"
              allow="fullscreen; encrypted-media"
            />
          </div>

          <div className="video-meta">
            <div className="meta-left">
              <h2>{active.title}</h2>
              <span>{active.match_date.replaceAll("_", "-")}</span>
            </div>
          </div>

          <div className="video-tabs">
            <button className="tab active">Highlights</button>
            <button className="tab">Goal4u</button>
          </div>
        </div>

        {/* Match Strip */}
        <div className="match-strip">
          {matches.map((m) => (
            <div
              key={m.id}
              className={
                "match-tile" + (active.id === m.id ? " active" : "")
              }
              onClick={() => setActive(m)}
            >
              <strong>{m.title}</strong>
              <span>{m.match_date.replaceAll("_", "-")}</span>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        /* --- SAME WIDTH AS HOMETV --- */
        .highlightsSectionWrapper {
          padding: 1.5rem;
          background: #f8f9fa;
        }

        .highlightsInner {
          max-width: 1320px;
          margin: 0 auto;
        }

        /* ---------- MAIN CARD ---------- */

        .video-card {
          background: #0b0f14;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          border: 1px solid #1c232b;
        }

        .video-frame {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
        }

        .video-frame iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        /* ---------- META ---------- */

        .video-meta {
          padding: 14px 16px;
          background: linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.9));
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .meta-left h2 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
        }

        .meta-left span {
          font-size: 13px;
          color: #cfd6dd;
        }

        /* ---------- TABS ---------- */

        .video-tabs {
          display: flex;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: #0e1319;
        }

        .video-tabs .tab {
          padding: 10px 16px;
          font-size: 13px;
          background: none;
          border: none;
          color: #9aa4ad;
          cursor: pointer;
          transition: 0.2s;
        }

        .video-tabs .tab:hover {
          color: #ffffff;
        }

        .video-tabs .tab.active {
          color: #00e5a8;
          border-bottom: 2px solid #00e5a8;
        }

        /* ---------- MATCH STRIP ---------- */

        .match-strip {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
          margin-top: 16px;
        }

        .match-tile {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 14px;
          cursor: pointer;
          transition: 0.2s ease;
          border: 1px solid #e1e6ec;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        .match-tile strong {
          display: block;
          font-size: 13px;
          color: #1f2933;
          margin-bottom: 2px;
        }

        .match-tile span {
          font-size: 12px;
          color: #5f6b76;
        }

        .match-tile:hover {
          background: #eef2f7;
        }

        .match-tile.active {
          background: #00e5a8;
          border-color: #00e5a8;
        }

        .match-tile.active strong,
        .match-tile.active span {
          color: #0b0f14;
          font-weight: 600;
        }

        /* ---------- MOBILE ---------- */

        @media (max-width: 900px) {
          .highlightsSectionWrapper {
            padding: 1rem 0.75rem;
          }

          .meta-left h2 {
            font-size: 16px;
          }

          .match-strip {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
