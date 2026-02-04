import { Link, useLocation } from "react-router-dom";
import React, { useEffect } from "react";

const MainMenu = () => {
  const location = useLocation();
  const isDark = location.pathname === "/livematch"; // dark theme only for /livematch

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadAllScripts = async () => {
      try {
        await loadScript("/assets/js/jquery.js"); // local jQuery
        await loadScript("https://code.jquery.com/jquery-3.6.4.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jQuery.mmenu/8.5.24/mmenu.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.sticky/1.0.4/jquery.sticky.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/superfish/1.7.10/js/superfish.min.js");
     await loadScript("/assets/js/theme-main.js"); 

        if (window.$) {
          // ❌ REMOVE THIS LINE to stop it from sticking
          // $(".mainmenu").sticky({ topSpacing: 0 }); 

          // ✅ Keep this if you still want the dropdowns to work
          $("ul.sf-menu").superfish();
        }
      } catch (error) {
        console.error("Failed to load one or more scripts:", error);
      }
    };

    loadAllScripts();
  }, []);

return (
    <>
      {/* ✅ ADD THIS STYLE BLOCK TO FORCE OVERRIDE THE JS PLUGIN */}
      <style>{`
        .mainmenu {
          position: relative !important;
          top: auto !important;
          left: auto !important;
          width: 100% !important;
          z-index: 10 !important;
        }

        /* The plugin creates a wrapper div - this neutralizes it */
        .sticky-wrapper {
          height: auto !important;
          position: relative !important;
        }
      `}</style>

      {/* Desktop Mainmenu */}
      <nav
        className="mainmenu"
        style={{
          backgroundColor: isDark ? "#111" : "#fff",
          // The CSS in the style tag above handles the positioning now
        }}
      >
        <div className="container">
          <ul
            className="sf-menu"
            id="menu"
            style={{
              color: isDark ? "#fff" : "#000",
            }}
          >
           {/* ... rest of your list items ... */}
            <li className="current">
              <a href="/" style={{ color: isDark ? "#fff" : "#000" }}>
                Home
              </a>
            </li>

            <li>
              <a href="/videos" style={{ color: isDark ? "#fff" : "#000" }}>
                Video4u
              </a>
            </li>

            <li className="current">
              <a href="/clubs" style={{ color: isDark ? "#fff" : "#000" }}>
                Teams
              </a>
              <ul className="sub-current">
                <li>
                  <a href="/league/laliga" style={{ color: isDark ? "#fff" : "#000" }}>
                    LaLiga
                  </a>
                </li>
                <li>
                  <a href="single-team.html" style={{ color: isDark ? "#fff" : "#000" }}>
                    Single Team
                  </a>
                </li>
              </ul>
            </li>

            <li className="current">
              <a href="/players" style={{ color: isDark ? "#fff" : "#000" }}>
                Players
              </a>
            </li>

            <li>
              <a href="/fixtures" style={{ color: isDark ? "#fff" : "#000" }}>
                Fixtures
              </a>
            </li>

            <li className="current">
              <a href="/livetv" style={{ color: isDark ? "#fff" : "#000" }}>
                Live
              </a>
            </li>

            <li>
              <a href="table-point.html" style={{ color: isDark ? "#fff" : "#000" }}>
                Point Table
              </a>
            </li>

            <li>
              <a href="groups.html" style={{ color: isDark ? "#fff" : "#000" }}>
                Groups
              </a>
            </li>



            <li>
              <Link to="/about" style={{ color: isDark ? "#fff" : "#000" }}>
                About
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default MainMenu;
