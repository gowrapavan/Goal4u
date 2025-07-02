import React, { useEffect, useState } from "react";
import { getTeamStatsById } from "../../services/teamStatsService";

const COMPETITIONS = ["EPL", "ESP", "ITSA","FRL1","DEB", "UCL", "CWC","EFAC"]; // Add/remove leagues as needed

const Stats = ({ teamId }) => {
  const [combinedStats, setCombinedStats] = useState(null);

  // Helper to round safely
  const r = (val) => Math.round(val || 0);

  useEffect(() => {
    const fetchAndAggregateStats = async () => {
      const year = new Date().getFullYear();
      let mergedStats = {};

      for (const comp of COMPETITIONS) {
        try {
          const stat = await getTeamStatsById(comp, year, parseInt(teamId));
          if (!stat) continue;

          Object.entries(stat).forEach(([key, value]) => {
            if (typeof value === "number") {
              mergedStats[key] = (mergedStats[key] || 0) + value;
            } else if (!mergedStats[key]) {
              mergedStats[key] = value;
            }
          });
        } catch (e) {
          console.warn(`Skipped ${comp} due to error`);
        }
      }

      setCombinedStats(mergedStats);
    };

    fetchAndAggregateStats();
  }, [teamId]);

  if (!combinedStats) {
    return (
      <div className="container text-center py-4">
        <p>Loading team stats...</p>
      </div>
    );
  }

  return (
    <div className="tab-pane active" id="stats">
      {/* Top Summary */}
      <div className="row">
        <div className="col-lg-12">
          <div className="stats-info">
            <ul>
              <li>Matches Played<h3>{r(combinedStats.Games)}</h3></li>
              <li>Goals<h3>{r(combinedStats.Goals)}</h3></li>
              <li>Assists<h3>{r(combinedStats.Assists)}</h3></li>
              <li>Goals Conceded<h3>{r(combinedStats.GoalkeeperGoalsAgainst)}</h3></li>
              <li>Clean Sheets<h3>{r(combinedStats.GoalkeeperCleanSheets)}</h3></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Panels (Attack, Team Play, Defence) */}
      <div className="row">
        {/* Attack */}
        <div className="col-lg-6 col-xl-4">
          <div className="panel-box">
            <div className="titles no-margin"><h4><i className="fa fa-calendar"></i>Attack</h4></div>
            <ul className="list-panel">
              <li><p>Goals <span>{r(combinedStats.Goals)}</span></p></li>
              <li><p>Shots <span>{r(combinedStats.Shots)}</span></p></li>
              <li><p>Shots on Goal <span>{r(combinedStats.ShotsOnGoal)}</span></p></li>
              <li><p>Penalties Scored <span>{r(combinedStats.PenaltyKickGoals)}</span></p></li>
              <li><p>Penalties Missed <span>{r(combinedStats.PenaltyKickMisses)}</span></p></li>
              <li><p>Crosses <span>{r(combinedStats.Crosses)}</span></p></li>
              <li><p>Corners Won <span>{r(combinedStats.CornersWon)}</span></p></li>
            </ul>
          </div>
        </div>

        {/* Team Play */}
        <div className="col-lg-6 col-xl-4">
          <div className="panel-box">
            <div className="titles no-margin"><h4><i className="fa fa-calendar"></i>Team Play</h4></div>
            <ul className="list-panel">
              <li><p>Passes <span>{r(combinedStats.Passes)}</span></p></li>
              <li><p>Completed Passes <span>{r(combinedStats.PassesCompleted)}</span></p></li>
              <li><p>Possession % <span>{r(combinedStats.Possession)}</span></p></li>
              <li><p>Assists <span>{r(combinedStats.Assists)}</span></p></li>
            </ul>
          </div>
        </div>

        {/* Defence */}
        <div className="col-lg-6 col-xl-4">
          <div className="panel-box">
            <div className="titles no-margin"><h4><i className="fa fa-calendar"></i>Defence</h4></div>
            <ul className="list-panel">
              <li><p>Clean Sheets <span>{r(combinedStats.GoalkeeperCleanSheets)}</span></p></li>
              <li><p>Goals Conceded <span>{r(combinedStats.GoalkeeperGoalsAgainst)}</span></p></li>
              <li><p>Saves <span>{r(combinedStats.GoalkeeperSaves)}</span></p></li>
              <li><p>Tackles <span>{r(combinedStats.Tackles)}</span></p></li>
              <li><p>Interceptions <span>{r(combinedStats.Interceptions)}</span></p></li>
              <li><p>Blocked Shots <span>{r(combinedStats.BlockedShots)}</span></p></li>
              <li><p>Own Goals <span>{r(combinedStats.OwnGoals)}</span></p></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
