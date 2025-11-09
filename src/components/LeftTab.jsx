import React, { useState } from 'react';
import RecentMatches from './RecentMatches'; // Ensure this is also static or mock data
import TopScorers from "./TopScorers";


const LeftTab = () => {
  const [activeTab, setActiveTab] = useState('statistics');

  // Dummy static recent matches (optional, remove if using hardcoded component instead)
  const recentMatches = []; // Leave it empty or use mock matches
  const loading = false;
  const error = null;

  const formatMatchDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Unknown Date';
    }
  };

  const getTeamLogo = (teamName) => {
    const teamLogos = {
      'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
      'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/330px-Logo_of_AC_Milan.svg.png',
      'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg/330px-FC_Bayern_M%C3%BCnchen_logo_%282024%29.svg.png',
      'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
      'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg',
      'Ajax': 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
      'Inter Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/768px-FC_Internazionale_Milano_2021.svg.png',
      'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg'
    };
    return teamLogos[teamName] || `https://ui-avatars.com/api/?name=${teamName?.charAt(0) || 'T'}&background=007bff&color=fff&size=30`;
  };

  return (
    <div>
      {/* TABS */}
      <ul className="nav nav-tabs" id="myTab">
        {['statistics', 'groups', 'description'].map(tab => (
          <li key={tab} className={activeTab === tab ? 'active' : ''}>
            <a
              href={`#${tab}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab);
              }}
            >
              {tab.toUpperCase()}
            </a>
          </li>
        ))}
      </ul>

      {/* CONTENT TABS */}
      <div className="tab-content">
        {/* STATISTICS */}
        <div className={`tab-pane ${activeTab === 'statistics' ? 'active' : ''}`} id="statistics">
          <div className="row">
            {/* Club Ranking */}
            <div className="col-lg-4">
              <div className="club-ranking">
                <h5><a href="group-list.html">Club Ranking (UCL Titles)</a></h5>
                <div className="info-ranking">
                  <ul>
                    {[
                      { name: 'Real Madrid', titles: 15 },
                      { name: 'AC Milan', titles: 7 },
                      { name: 'Bayern Munich', titles: 6 },
                      { name: 'Liverpool', titles: 6 },
                      { name: 'Barcelona', titles: 5 },
                      { name: 'Ajax', titles: 4 },
                      { name: 'Inter Milan', titles: 3 },
                      { name: 'Manchester United', titles: 3 }
                    ].map((club, index) => (
                      <li key={club.name}>
                        <span className="position">{index + 1}</span>
                        <a href="single-team.html">
                          <img src={getTeamLogo(club.name)} alt={club.name} />
                          {club.name}
                        </a>
                        <span className="points">{club.titles}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Matches (Optional Static/Mapped) */}
            <RecentMatches
              recentMatches={recentMatches}
              loading={loading}
              error={error}
              refetch={() => {}}
              formatMatchDate={formatMatchDate}
              getTeamLogo={getTeamLogo}
            />

            <TopScorers />


          </div>
        </div>

        {/* GROUPS & DESCRIPTION tabs stay as-is (you already have static data) */}
        {/* You don’t need to change those sections */}

      </div>
    </div>
  );
};

export default LeftTab;
