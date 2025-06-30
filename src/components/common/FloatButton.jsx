import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const FloatButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const isLive = "true"; // 🔥 Force enable for testing
    if (isLive === "true") setShowButton(true);

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToHomeTV = () => {
    const el = document.querySelector("[data-hometv]");
    if (el) {
      const offset = -60;
      const y = el.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // ✅ Show button only on homepage where HomeTV exists
  if (!showButton || location.pathname !== "/") return null;

  return (
    <button
      onClick={scrollToHomeTV}
      style={{
        position: "fixed",
        bottom: isMobile ? "40px" : "10px", // space for mobile footer
        right: "20px", // 👉 moved to right
        zIndex: 9999,
        backgroundColor: "#33ffc9",
        color: "#000",
        padding: "1px 8px",
        border: "none",
        borderRadius: "1px",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {isMobile ? "📺 Live" : "📺 Watch Live"}
    </button>
  );
};

export default FloatButton;
