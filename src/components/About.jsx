import React from "react";
import { Helmet } from "react-helmet-async";
import uclImg from "../../public/assets/img/ucl.jpg";
import leagueImg from "../../public/assets/img/league.jpg";
import playerImg from "../../public/assets/img/player.jpg";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Goal4U | Football Stats, Matches & News</title>
        <meta
          name="description"
          content="Learn about Goal4U – your all-in-one platform for global football updates, live scores, stats, news, and legendary moments from top leagues."
        />
        <meta property="og:title" content="About Goal4U - Football Livescore Platform" />
        <meta property="og:description" content="Explore Goal4U's mission to bring football fans real-time updates, stats, and memories from the world's biggest leagues." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://goal4u.netlify.app/about" />
        <link rel="canonical" href="https://goal4u.netlify.app/about" />
      </Helmet>

      <section className="py-5 bg-white text-dark">
        <div className="container">


        {/* Hero Title */}
        <div className="text-center mb-5">
          <h2 className="display-4 font-weight-bold">
            Welcome to <span style={{ color: "#00d084" }}>GOAL4U</span>
          </h2>
          <p className="h6 text-success font-weight-bold">
            Global Online Access League for Unlimited Football Updates
          </p>
          <p className="text-muted mx-auto mt-3" style={{ maxWidth: "700px" }}>
            Your all-in-one platform for global football — bringing fans, teams, and data together in real time.
          </p>
        </div>

        {/* Features Section */}
        <div className="row text-center mb-5">
          {[
            {
              title: "Live Fixtures",
              desc: "Track every match as it happens — live updates, kickoff times, and team sheets.",
            },
            {
              title: "Standings & Stats",
              desc: "Follow league tables, top scorers, and deep match analytics.",
            },
            {
              title: "Media & Content",
              desc: "Relive the moments with highlight reels, interviews, and fan content.",
            },
          ].map((item, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="p-4 bg-light border rounded shadow-sm h-100">
                <h5 className="text-success mb-2">{item.title}</h5>
                <p className="text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Image Showcase with Descriptions */}
        <div className="text-center mb-5">
          <h3 className="font-weight-bold mb-4">Moments from the Pitch</h3>
          <div className="row">

            {/* UCL Image */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <img src={uclImg} alt="UEFA Champions League" className="card-img-top rounded-top" />
                <div className="card-body">
                  <h5 className="card-title text-success">UEFA Champions League 2024–2025</h5>
                  <p className="card-text text-muted">
                    The road to Berlin begins here. Follow every twist and turn of Europe’s elite tournament with GOAL4U — complete with real-time updates, group breakdowns, top scorers, and knockout drama as it unfolds.
                  </p>
                </div>
              </div>
            </div>

            {/* League Image */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <img src={leagueImg} alt="European Leagues" className="card-img-top rounded-top" />
                <div className="card-body">
                  <h5 className="card-title text-success">24/7 League Coverage</h5>
                  <p className="card-text text-muted">
                    From La Liga's flair to Premier League intensity — GOAL4U runs a dedicated multi-server infrastructure ensuring uninterrupted coverage and data flow from all major and minor European leagues. Always on. Always live.
                  </p>
                </div>
              </div>
            </div>

            {/* Player Image */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <img src={playerImg} alt="Legends of the Game" className="card-img-top rounded-top" />
                <div className="card-body">
                  <h5 className="card-title text-success">Legends of the Game</h5>
                  <p className="card-text text-muted">
                    Two names, one legacy — Messi and Ronaldo. GOAL4U celebrates their legendary careers with stat comparisons, record charts, and unforgettable highlights that define football’s golden generation.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Competitions Section */}
        <div className="text-center mb-5">
          <h3 className="font-weight-bold mb-4">Featured Competitions</h3>
          <div className="row">
            {[
              "UEFA Champions League",
              "Premier League",
              "La Liga",
              "Bundesliga",
              "Serie A",
              "EURO 2024"
            ].map((league, i) => (
              <div key={i} className="col-6 col-md-4 mb-3">
                <div className="p-3 bg-white border rounded shadow-sm h-100">
                  <span className="text-success font-weight-bold">{league}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission / Vision Section */}
        <div className="text-center mb-5">
          <h3 className="font-weight-bold mb-3">Our Mission</h3>
          <p className="text-muted mx-auto" style={{ maxWidth: "800px", lineHeight: "1.8" }}>
            GOAL4U exists to unify football fans across the world. We aim to deliver reliable data, authentic stories, and rich multimedia experiences — all accessible in one place. Whether you're in Lisbon, Berlin, or Hyderabad, the beautiful game belongs to you.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-light p-5 rounded shadow-sm">
          <h4 className="font-weight-bold mb-3">Join the GOAL4U Community</h4>
          <p className="text-muted mb-4">
            Explore matchday insights, follow your icons, and relive history. Stay in the game — stay with GOAL4U.
          </p>
          <a href="/signup" className="btn btn-success px-4 py-2">Get Started</a>
        </div>

        </div>
      </section>
    </>
  );
};

export default About;
