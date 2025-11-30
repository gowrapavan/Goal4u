import React, { useState, useEffect } from "react";

// --- Configuration ---
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/teams/";
const LEAGUE_FILES = [
  "ESP", "EPL", "DEB", "BSA", "DED", "EC", "ELC", 
  "FRL1", "ITSA", "POR", "UCL", "WC"
];

// --- CSS Styles ---
// We inject the styles directly into the page's <head>
const ClubSliderStyles = () => (
  <style>{`
    /* --- Animation for the slider --- */
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        /* Move left by the width of one full set of logos */
        transform: translateX(-50%);
      }
    }

    .logo-slider-container {
      width: 100%;
      /* --- FIX 2: LIGHT BACKGROUND --- */
      background-color: #f8f9fa; /* Light background */
      border-top: 1px solid #e9ecef; /* Added borders for separation */
      border-bottom: 1px solid #e9ecef;
      padding: 16px 0;
      overflow: hidden;
      white-space: nowrap; /* Keep logos in one line */
      box-sizing: border-box;
    }

    .logo-slider-track {
      display: inline-block; /* Use inline-block for the animation */
      /* --- FIX 1: SLOWED DOWN --- */
      /* Was 90s, now 180s for a much slower scroll */
      animation: scroll 180s linear infinite; 
      white-space: nowrap;
    }

    .logo-slider-container:hover .logo-slider-track {
      animation-play-state: paused; /* Pause on hover */
    }

    .logo-slide {
      display: inline-flex; /* Use inline-flex for slides */
      align-items: center;
      justify-content: center;
      width: 50px; /* Fixed width for each logo */
      height: 40px; /* Fixed height */
      margin: 0 20px;
    }

    .logo-slide img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      /* --- FIX 3: LOGO STYLE FOR LIGHT BG --- */
      /* Removed brightness(0.7) which is for dark BGs */
      filter: grayscale(100%);
      opacity: 0.6; /* Dim the logo slightly */
      transition: filter 0.3s ease, opacity 0.3s ease;
    }

    .logo-slide:hover img {
      filter: grayscale(0%) brightness(1); /* Full color on hover */
      opacity: 1;
    }

    /* --- Mobile Styles --- */
    @media (max-width: 768px) {
      .logo-slide {
        width: 40px; /* Smaller logos on mobile */
        height: 40px; /* Fixed height */

        margin: 0 15px;
      }
    }
  `}</style>
);


// --- React Component ---
const ClubSlider = () => {
  const [allTeamLogos, setAllTeamLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all teams just to get their logos
  useEffect(() => {
    const fetchAllLogos = async () => {
      setLoading(true);
      try {
        const fetchPromises = LEAGUE_FILES.map(league =>
          fetch(`${GITHUB_RAW_URL}${league}.json`)
            .then(res => {
              if (!res.ok) {
                console.error(`Failed to fetch ${league}.json`);
                return []; // Return empty on failure
              }
              return res.json();
            })
            .catch(err => {
              console.error(`Error fetching ${league}:`, err);
              return [];
            })
        );
        
        const results = await Promise.all(fetchPromises);
        
        // Flatten all teams into one array, then map to get just logo/name
        const allLogos = results
          .flat()
          .map(team => ({ crest: team.crest, name: team.name }));
        
        // Remove duplicates in case teams are in multiple files (e.g., EPL and UCL)
        const uniqueLogos = Array.from(new Map(allLogos.map(logo => [logo.crest, logo])).values());

        // Duplicate the unique logos for a seamless loop
        setAllTeamLogos([...uniqueLogos, ...uniqueLogos]);

      } catch (err) {
        console.error("Error processing team logos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllLogos();
  }, []);

  // Show a simple loader or nothing while loading
  if (loading) {
    return (
      <div className="logo-slider-container" style={{ minHeight: '72px' }}>
        {/* Can add a loading spinner here if you want */}
      </div>
    );
  }

  return (
    <>
      <ClubSliderStyles /> {/* This injects the CSS */}
      <div className="logo-slider-container">
        <div className="logo-slider-track">
          {allTeamLogos.map((logo, index) => (
            <div className="logo-slide" key={index} title={logo.name}>
              <img src={logo.crest} alt={`${logo.name} crest`} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ClubSlider;