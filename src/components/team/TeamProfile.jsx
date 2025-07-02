import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Overview from "./Overview";
import Squad from "./Squad";
import Fixture from "./Fixtures";
import Results from "./Results";
import Stats from "./Stats";
import { getTeamById } from "../../services/teamProfileService";
import NotFound404 from "../NotFound404";

const TeamProfile = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [teamData, setTeamData] = useState(null);
  const [competition, setCompetition] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");

  const renderTabClass = (tab) => (activeTab === tab ? "tab-pane active" : "tab-pane");

  const handleTabChange = (tab) => (e) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get("q");

    if (!encoded) {
      setError("Missing team data.");
      return;
    }

    try {
      const decoded = atob(encoded); // "CWC_605"
      const [comp, id] = decoded.split("_");
      if (!comp || !id) {
        throw new Error("Invalid format");
      }

      setCompetition(comp);
      setTeamId(id);
      fetchTeamData(comp, parseInt(id));
    } catch (err) {
      console.error("Decode error:", err);
      setError("Invalid team ID format.");
    }
  }, [location.search]);

  const fetchTeamData = async (competition, teamId) => {
    try {
      const data = await getTeamById(competition, teamId);
      setTeamData({
        ...data,
        Season: new Date().getFullYear(),         // 🔁 required for stats
        Competition: competition.toLowerCase()    // 🔁 required for stats
      });
    } catch (err) {
      setError(err.message || "Failed to load team data.");
    }
  };

  if (error) return <NotFound404 message={error} />;
  if (!teamData) {
    return (
      <div className="container text-center py-4">
        <p>Loading team profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="section-title-team">
        <div className="container">
          <div className="row">
            <div className="col-xl-7">
              <div className="row">
                <div className="col-md-3">
                  <img
                    src={teamData.WikipediaLogoUrl || "img/clubs-logos/col_logo.png"}
                    alt={teamData.Name}
                  />
                </div>
                <div className="col-md-9">
                  <h1>{teamData.Name}</h1>
                  <ul className="general-info">
                    <li><h6><strong>Foundation:</strong> {teamData.Founded || "N/A"}</h6></li>
                    <li><h6><strong>Club Type:</strong> {teamData.Type || "N/A"}</h6></li>
                    <li><h6><strong>Location:</strong> {teamData.AreaName || "N/A"}</h6></li>
                    <li>
                      <h6>
                        <i className="fa fa-link" aria-hidden="true"></i>{" "}
                        {teamData.Website ? (
                          <a href={teamData.Website} target="_blank" rel="noreferrer">
                            {teamData.Website}
                          </a>
                        ) : "N/A"}
                      </h6>
                    </li>
                  </ul>
                  <ul className="social-teams">
                    <li><a href="#" className="facebook"><i className="fa fa-facebook" /></a></li>
                    <li><a href="#" className="twitter-icon"><i className="fa fa-twitter" /></a></li>
                    <li><a href="#" className="youtube"><i className="fa fa-youtube" /></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-image-team" style={{ background: `url(assets/img/yt-banner.png)` }}></div>
      </div>

      <section className="content-info">
        <div className="single-team-tabs">
          <div className="container">
            <div className="row">
              <div className="col-xl-12 col-md-12">
                <ul className="nav nav-tabs" id="myTab">
                  {["overview", "squad", "fixtures", "results", "stats"].map((tab) => (
                    <li key={tab} className={activeTab === tab ? "active" : ""}>
                      <a href={`#${tab}`} onClick={handleTabChange(tab)}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-lg-9 padding-top-mini">
                <div className="tab-content">
                  {activeTab === "overview" && <Overview teamData={teamData} />}
                  {activeTab === "squad" && <Squad teamData={teamData} />}
                  {activeTab === "fixtures" && (
                    <Fixture teamData={teamData} comp={competition} teamId={teamId} />
                  )}
                  {activeTab === "results" && (
                    <Results teamData={teamData} comp={competition} teamId={teamId} />
                  )}
                  {activeTab === "stats" && <Stats teamData={teamData} comp={competition} teamId={teamId} />}
                </div>
              </div>

              <div className="col-lg-3 padding-top-mini">
                {/* Optional Sidebar */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeamProfile;
