import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { useLocation, useNavigate } from "react-router-dom";

const PROVIDERS = [
  { label: "Sportzonline", keyword: "sportzonline" },
  { label: "Doublexx", keyword: "doublexx" },
  { label: "Koora10", keyword: "koora10" },
  { label: "Shahid-Koora", keyword: "shahidkoora" },
];

const jsonFiles = [
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/sportsonline.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/doublexx.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/koora10.json",
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/json/shahidkoora.json",
];

const encode = (str) => btoa(unescape(encodeURIComponent(str)));
const decode = (str) => {
  try { return decodeURIComponent(escape(atob(str))); } 
  catch { return ""; }
};

const StreamTab = ({ active }) => {
  const [channels, setChannels] = useState([]);
  const [iframeURL, setIframeURL] = useState("");
  const [selectedStream, setSelectedStream] = useState("doublexx");
  const [alertMessage, setAlertMessage] = useState("");
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  // Fetch JSON channels
  useEffect(() => {
    let isMounted = true;
    Promise.all(
      jsonFiles.map((file) =>
        fetch(file).then((res) => res.json()).catch(() => [])
      )
    ).then((results) => {
      if (!isMounted) return;
      const all = results.flat().filter(Boolean);
      setChannels(all);

      const params = new URLSearchParams(location.search);
      const code = params.get("stream");
      if (code) {
        const decoded = decode(code);
        const matched = all.find(
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
        const defaultChannel = all.find((c) =>
          c.url.toLowerCase().includes("doublexx")
        );
        if (defaultChannel) setIframeURL(defaultChannel.url);
      }
    });
    return () => { isMounted = false; };
  }, [location.search]);

  // Update URL with short code while preserving matchId
  useEffect(() => {
    if (!iframeURL || channels.length === 0) return;

    const matchedChannel = channels.find((c) => c.url === iframeURL);
    if (!matchedChannel) return;

    const encodedLabel = encode(matchedChannel.label);
    const params = new URLSearchParams(location.search);

    // Preserve existing params like matchId
    params.set("stream", encodedLabel);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [iframeURL, channels, location.pathname, location.search, navigate]);

  // Filter channels by selected provider
  const filteredChannels = channels.filter((c) =>
    c.url.toLowerCase().includes(selectedStream)
  );

  // Auto-select first channel if current iframeURL not in filtered
  useEffect(() => {
    if (
      filteredChannels.length > 0 &&
      !filteredChannels.some((c) => c.url === iframeURL)
    ) {
      setIframeURL(filteredChannels[0].url);
    }
  }, [selectedStream, channels, filteredChannels, iframeURL]);

  // HLS load logic
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
          showAlert("Failed to load stream. Please try another server.");
          hls.destroy();
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url;
    }
  };

  useEffect(() => {
    if (!active) return;
    if (iframeURL && iframeURL.endsWith(".m3u8")) loadHls(iframeURL);
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [iframeURL, active]);

  const renderChannelCard = (server) => {
    const isActive = iframeURL === server.url;
    return (
      <div
        key={server.label}
        onClick={() => setIframeURL(server.url)}
        style={{
          width: "80px",
          height: "100px",
          borderRadius: "10px",
          border: isActive ? "2px solid #33ffc9" : "1px solid #ccc",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          padding: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          fontSize: "12px",
          flexShrink: 0,
        }}
      >
        <img
          src={server.Logo?.trim() || "/assets/img/6.png"}
          alt={server.label}
          style={{ width: "40px", height: "40px", objectFit: "contain", marginBottom: "6px" }}
        />
        <span>{server.label}</span>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      {alertMessage && (
        <div style={{ background: "#ffe9e9", color: "#c0392b", padding: "10px", borderRadius: "5px" }}>
          {alertMessage}
        </div>
      )}

      <div style={{ width: "90vw", maxWidth: "1000px", aspectRatio: "16/9", background: "#000", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
        {iframeURL.endsWith(".m3u8") ? (
          <video ref={videoRef} controls autoPlay muted style={{ width: "100%", height: "100%" }} />
        ) : (
          <iframe
            src={iframeURL}
            title="Live Stream"
            allowFullScreen
            scrolling="no"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </div>

      <select
        value={selectedStream}
        onChange={(e) => setSelectedStream(e.target.value)}
        style={{ padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}
      >
        {PROVIDERS.map((p) => (
          <option key={p.keyword} value={p.keyword}>{p.label}</option>
        ))}
      </select>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", overflowX: "auto" }}>
        {filteredChannels.map(renderChannelCard)}
      </div>
    </div>
  );
};

export default StreamTab;
