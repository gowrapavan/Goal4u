import React from 'react';

// --- CSS Styles for StatsSection ---
const StatsSectionStyles = () => (
  <style>{`
    /* --- Root Variables for Professional Theme (if not already global) --- */
    /* Add these if you don't have global variables in your App.css or index.css */
    :root {
      --color-brand: #10a30b; /* Darker green for accessibility */
      --color-text-primary: #212529; /* Dark grey */
      --color-text-secondary: #6c757d; /* Medium grey */
      --color-bg-light: #ffffff;
      --color-bg-medium: #f8f9fa; /* Subtle off-white */
      --color-border: #e9ecef; /* Lighter border */
      --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 4px 10px rgba(0, 0, 0, 0.08);
      --border-radius-md: 8px;
    }

    .stats-section-container {
      background-color: var(--color-bg-light); /* White background to match your theme */
      padding: 40px 20px; /* Ample padding */
      border-bottom: 1px solid var(--color-border); /* Subtle separation */
      text-align: center; /* Center content within the section */
    }

    .stats-section-title {
      font-size: 2.5rem; /* Larger, impactful title */
      font-weight: 800;
      color: var(--color-text-primary);
      margin-bottom: 50px; /* Space before stats cards */
      line-height: 1.2;
      letter-spacing: -0.02em;
      text-align: center; /* Explicitly center the text */
      max-width: 800px; /* Constrain width for better readability */
      margin-left: auto;
      margin-right: auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Responsive grid */
      gap: 25px; /* Spacing between cards */
      max-width: 1200px; /* Max width for the grid */
      margin: 0 auto; /* Center the grid */
      justify-content: center; /* Center items if they don't fill the row */
    }

    .stat-card {
      background-color: var(--color-bg-medium); /* Light grey for the card background */
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: 25px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md); /* Slightly more prominent shadow on hover */
    }

    .stat-value {
      font-size: 2.2rem; /* Large stat value */
      font-weight: 700;
      color: var(--color-brand); /* Your brand green */
      margin-bottom: 8px;
      line-height: 1;
    }
    
    .stat-value.highlight {
        background: linear-gradient(90deg, #b8ff00, #15c70b); /* Your yellow/green gradient */
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        color: var(--color-brand); /* Fallback for non-webkit */
    }


    .stat-description {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    /* --- Responsive adjustments --- */
    @media (max-width: 1024px) {
      .stats-section-title {
        font-size: 2.2rem;
        margin-bottom: 40px;
      }
      .stats-grid {
        gap: 20px;
      }
      .stat-value {
        font-size: 2rem;
      }
    }

    @media (max-width: 768px) {
      .stats-section-container {
        padding: 30px 15px;
      }
      .stats-section-title {
        font-size: 1.8rem;
        margin-bottom: 30px;
      }
      .stats-grid {
        /* Keep horizontal on mobile, allow scrolling */
        grid-template-columns: repeat(4, minmax(180px, 1fr)); /* Ensure 4 columns are attempted */
        overflow-x: auto; /* Enable horizontal scrolling */
        justify-content: start; /* Align items to the start */
        padding-bottom: 10px; /* Space for scrollbar */
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
      }
      .stat-card {
        flex-shrink: 0; /* Prevent cards from shrinking */
        width: 180px; /* Fixed width for horizontal scroll */
        padding: 20px;
      }
      .stat-value {
        font-size: 1.8rem;
      }
      .stat-description {
        font-size: 0.9rem;
      }
    }
  `}</style>
);

const StatsSection = () => {
  return (
    <>
      <StatsSectionStyles /> {/* Inject the CSS */}
      <section className="stats-section-container">
        <h2 className="stats-section-title">
          CONTENT THAT CELEBRATES <br /> THE BEAUTIFUL GAME
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value highlight">120M+</div> {/* Added highlight class */}
            <p className="stat-description">Total followers, all platforms combined</p>
          </div>
          <div className="stat-card">
            <div className="stat-value">77M+</div>
            <p className="stat-description">Followers on @Goal4U Instagram</p> {/* Updated description */}
          </div>
          <div className="stat-card">
            <div className="stat-value">9B+</div>
            <p className="stat-description">Views per month</p>
          </div>
          <div className="stat-card">
            <div className="stat-value">14.4%</div>
            <p className="stat-description">Engagement rate on reach</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default StatsSection;