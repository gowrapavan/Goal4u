import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { useLocation, useNavigate } from "react-router-dom";

/* ================= CONFIG ================= */

const PROVIDERS = [
  { label: "Sportzonline", keyword: "sportzonline" },
  { label: "Doublexx", keyword: "doublexx" },
  { label: "Koora10", keyword: "koora10" },
  { label: "Shahid-Koora", keyword: "shahidkoora" },
];

const STREAM_JSONS = [
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/sportsonline.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/doublexx.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/koora10.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/shahidkoora.json",
];

const HIGHLIGHTS_JSON =
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/Highlights/Highlight.json";

/* ================= HELPERS ================= */

const encode = (str) => btoa(unescape(encodeURIComponent(str)));
const decode = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "";
  }
};

/* ================= COMPONENT ================= */

const StreamTab = ({ active }) => {
  const [channels, setChannels] = useState([]);
  const [iframeURL, setIframeURL] = useState("");
  const [selectedStream, setSelectedStream] = useState("doublexx");
  const [alertMessage, setAlertMessage] = useState("");
  const [highlight, setHighlight] = useState(null);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  /* ================= LOAD HIGHLIGHT ================= */

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const matchId = params.get("matchId");

    if (!matchId) return;

    fetch(HIGHLIGHTS_JSON)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find(
          (h) =>
            String(h.game_id) === String(matchId) &&
            h.status === "Final" &&
            h.embed_url
        );

        if (found) {
          setHighlight(found);
          setIframeURL(found.embed_url);
        }
      })
      .catch(() => {});
  }, [location.search]);

  /* ================= LOAD STREAM JSONS ================= */

  useEffect(() => {
    if (highlight) return;

    let mounted = true;

    Promise.all(
      STREAM_JSONS.map((url) =>
        fetch(url).then((r) => r.json()).catch(() => [])
      )
    ).then((results) => {
      if (!mounted) return;

      const allChannels = results.flat().filter(Boolean);
      setChannels(allChannels);

      const params = new URLSearchParams(location.search);
      const code = params.get("stream");

      if (code) {
        const decoded = decode(code);
        const matched = allChannels.find(
          (c) => c.label.toLowerCase() === decoded.toLowerCase()
        );
        if (matched) {
          setIframeURL(matched.url);
          const provider = PROVIDERS.find((p) =>
            matched.url.toLowerCase().includes(p.keyword)
          );
          if (provider) setSelectedStream(provider.keyword);
        }
      } else {
        const def = allChannels.find((c) =>
          c.url.toLowerCase().includes("doublexx")
        );
        if (def) setIframeURL(def.url);
      }
    });

    return () => {
      mounted = false;
    };
  }, [location.search, highlight]);

  /* ================= URL SHORT CODE ================= */

  useEffect(() => {
    if (!iframeURL || highlight || channels.length === 0) return;

    const matched = channels.find((c) => c.url === iframeURL);
    if (!matched) return;

    const params = new URLSearchParams(location.search);
    params.set("stream", encode(matched.label));

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [iframeURL, channels, location.pathname, location.search, navigate, highlight]);

  /* ================= FILTER PROVIDERS ================= */

  const filteredChannels = channels.filter((c) =>
    c.url.toLowerCase().includes(selectedStream)
  );

  useEffect(() => {
    if (
      !highlight &&
      filteredChannels.length > 0 &&
      !filteredChannels.some((c) => c.url === iframeURL)
    ) {
      setIframeURL(filteredChannels[0].url);
    }
  }, [selectedStream, filteredChannels, iframeURL, highlight]);

  /* ================= HLS ================= */

  const loadHls = (url) => {
    if (!videoRef.current || !url) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          showAlert("Stream failed. Try another server.");
          hls.destroy();
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url;
    }
  };

  useEffect(() => {
    if (!active || highlight) return;

    if (iframeURL?.endsWith(".m3u8")) loadHls(iframeURL);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [iframeURL, active, highlight]);

  /* ================= UI ================= */

  const renderChannelCard = (server) => {
    const activeCard = iframeURL === server.url;

    return (
      <div
        key={server.label}
        onClick={() => setIframeURL(server.url)}
        style={{
          width: 80,
          height: 100,
          borderRadius: 10,
          border: activeCard ? "2px solid #33ffc9" : "1px solid #ccc",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          padding: 6,
          boxShadow: "0 2px 6px rgba(0,0,0,.15)",
          fontSize: 12,
        }}
      >
        <img
          src={server.Logo || "/assets/img/6.png"}
          alt={server.label}
          style={{ width: 40, height: 40, objectFit: "contain" }}
        />
        <span>{server.label}</span>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {alertMessage && (
        <div style={{ background: "#ffe9e9", color: "#c0392b", padding: 10, borderRadius: 6 }}>
          {alertMessage}
        </div>
      )}

      {/* PLAYER */}
      <div
        style={{
          width: "90vw",
          maxWidth: 1000,
          aspectRatio: "16/9",
          background: "#000",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {highlight ? (
          <iframe
            src={highlight.embed_url}
            title="Match Highlights"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : iframeURL?.endsWith(".m3u8") ? (
          <video ref={videoRef} controls autoPlay muted style={{ width: "100%", height: "100%" }} />
        ) : (
          <iframe
            src={iframeURL}
            title="Live Stream"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </div>

      {/* STREAM UI */}
      {!highlight && (
        <>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6 }}
          >
            {PROVIDERS.map((p) => (
              <option key={p.keyword} value={p.keyword}>
                {p.label}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {filteredChannels.map(renderChannelCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default StreamTab;
