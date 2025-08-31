import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// --- Constants and Configuration ---
const CODE_MAP_KEYS = {
  elixx: "livetv_code_map_elixx",
  sportzonline: "livetv_code_map_sportzonline",
  vivosoccer: "livetv_code_map_vivosoccer",
  koora: "livetv_code_map_koora"
};

const PARAM_KEYS = {
  elixx: "elx",
  sportzonline: "sptz",
  vivosoccer: "viv",
  koora: "kor",
};

const jsonFiles = [
  "/TV-streams/sportzonline.json",
  "/TV-streams/vivosoccer.json",
  "/TV-streams/elixx.json",
  "/TV-streams/koora.json"
];

export const PROVIDERS = [
  { label: "Vivosoccer", keyword: "vivosoccer" },
  { label: "Sportzonline", keyword: "sportzonline" },
  { label: "Elixx", keyword: "elixx" },
  { label: "Koora", keyword: "koora" }
];

// --- Utility Functions ---
function generateShortCode() {
  return Math.random().toString(36).substring(2, 14);
}

function saveCodeMap(provider, map) {
  localStorage.setItem(CODE_MAP_KEYS[provider], JSON.stringify(map));
}

function loadCodeMap(provider) {
  try {
    return JSON.parse(localStorage.getItem(CODE_MAP_KEYS[provider])) || {};
  } catch {
    return {};
  }
}

const encode = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

const decode = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return "";
  }
};

// --- Custom Hook for LiveTV Logic ---
export const useLiveTV = () => {
  const [channels, setChannels] = useState([]);
  const [iframeURL, setIframeURL] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showAdAlert, setShowAdAlert] = useState(false);
  const [selectedStream, setSelectedStream] = useState(PROVIDERS[2].keyword); // default Elixx
  const location = useLocation();
  const navigate = useNavigate();

  // --- Effect: Handle URL parameters and determine initial stream ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const determineInitialStream = (channelList) => {
      const code = params.get("stream");
      if (code) {
        const decodedLabel = decode(code);
        const matched = channelList.find((c) => c.label.toLowerCase() === decodedLabel.toLowerCase());
        if (matched) {
          setIframeURL(matched.url);
          const matchedProvider = PROVIDERS.find((p) => matched.url.toLowerCase().includes(p.keyword));
          if (matchedProvider) setSelectedStream(matchedProvider.keyword);
          return true;
        }
      }
    };

    let isMounted = true;
    Promise.all(
      jsonFiles.map((file) =>
        fetch(file)
          .then((res) => res.json())
          .catch(() => [])
      )
    ).then((results) => {
      if (!isMounted) return;
      const all = results.flat().filter(Boolean);
      setChannels(all);

      const matched = determineInitialStream(all);

      // No param or no match: default to Elixx
      if (
        !matched &&
        location.pathname === "/livetv" &&
        Array.from(params.keys()).length === 0
      ) {
        const defaultProvider = "elixx";
        setSelectedStream(defaultProvider);
        const defaultChannel = all.find((c) =>
          c.url.toLowerCase().includes(defaultProvider)
        );
        if (defaultChannel) {
          setIframeURL(defaultChannel.url);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location.search, location.pathname]);

  // --- Effect: Fetch all channels from JSON files ---
  useEffect(() => {
    let isMounted = true;
    Promise.all(
      jsonFiles.map((file) =>
        fetch(file)
          .then((res) => res.json())
          .catch(() => [])
      )
    ).then((results) => {
      if (!isMounted) return;
      const all = results.flat().filter(Boolean);
      setChannels(all);

      // Only set default if no code param in URL and path is exactly /livetv (no params at all)
      const params = new URLSearchParams(location.search);
      let hasCode = false;
      hasCode = params.has("stream");

      if (
        !hasCode &&
        location.pathname === "/livetv" &&
        Array.from(params.keys()).length === 0
      ) {
        // Set default channel if available and matches default provider (Elixx)
        const defaultProvider = "elixx";
        const defaultChannel = all.find((c) =>
          c.url.toLowerCase().includes(defaultProvider)
        );
        if (defaultChannel) setIframeURL(defaultChannel.url);
        else if (all.length > 0) setIframeURL(all[0].url);
      }
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [location.search, location.pathname]);

  // --- Effect: Handle window resize ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Effect: Handle fullscreen changes ---
  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFullscreen && iframeURL) {
        setShowAdAlert(true);
        setTimeout(() => setShowAdAlert(false), 10000);
      } else {
        setShowAdAlert(false);
      }
    };
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    checkFullscreen();
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, [iframeURL]);

  // --- Effect: Update URL when stream/channel changes ---
  useEffect(() => {
    if (!iframeURL) return;
    // Find provider for current stream
    const provider = PROVIDERS.find((p) =>
      iframeURL.toLowerCase().includes(p.keyword)
    )?.keyword;
    if (!provider) return;

    const matchedChannel = channels.find(c => c.url === iframeURL);
    if (!matchedChannel) return;

    // Encode the channel label
    const encodedLabel = encode(matchedChannel.label);

    // Determine correct param key
    navigate(`${location.pathname}?stream=${encodedLabel}`, { replace: true });

    // eslint-disable-next-line
  }, [iframeURL]);

  // --- Effect: Auto-select first filtered channel when provider changes ---
  useEffect(() => {
    const filteredChannels = channels.filter((c) =>
      c.url.toLowerCase().includes(selectedStream)
    );
    
    if (
      filteredChannels.length > 0 &&
      !filteredChannels.some((c) => c.url === iframeURL)
    ) {
      setIframeURL(filteredChannels[0].url);
    }
    // eslint-disable-next-line
  }, [selectedStream, channels]);

  // --- Event Handlers ---
  const handleIframeClick = (url) => {
    setIframeURL(url);
  };

  const handleProviderChange = (provider) => {
    setSelectedStream(provider);
  };

  const handleCloseAlert = () => {
    setShowAdAlert(false);
  };

  // --- Computed Values ---
  const filteredChannels = channels.filter((c) =>
    c.url.toLowerCase().includes(selectedStream)
  );

  return {
    // State
    channels,
    iframeURL,
    isMobile,
    showAdAlert,
    selectedStream,
    filteredChannels,
    
    // Handlers
    handleIframeClick,
    handleProviderChange,
    handleCloseAlert,
  };
};