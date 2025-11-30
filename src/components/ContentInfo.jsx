import React from 'react';
import LeftTab from './LeftTab';
import RightTab from './RightTab';
import News from './News';
import Players from './Players';
import Stadiums from './Stadiums';
import Diary from './Diary';
import HomeTV from './HomeTV'; // ✅ Import HomeTV
import StatsSection from './StatsSection'; // <-- Import the new component
import ClubSlider from './Sliders/ClubSlider'; // <-- 1. IMPORT IT
import MatchSlider from './Sliders/MatchSlider'; // <-- 1. IMPORT IT

const ContentInfo = () => {
  return (
    <section className="content-info">
      

      {/* Dark Home */}
      <div className="dark-home">
        <div className="container">
          <div className="row">
            {/* Left Content - Tabs and Carousel */}
            <div className="col-xl-9 col-md-12">
              <LeftTab />
            </div>

            {/* Right Content - Content Counter */}
            <div className="col-xl-3 col-md-12">
              <RightTab />
            </div>
          </div>
        </div>
      </div>
                                <MatchSlider />

      {/* ✅ Add Live TV Section */}
      <div data-hometv>
        <HomeTV />
      </div>
     
            <ClubSlider />
            <StatsSection />

      {/* Content Central */}
      <div className="container padding-top">
        <div className="row">
          {/* content Column Left */}
          <div className="col-lg-6 col-xl-7">
            <News />
            <Players />
          </div>

          {/* content Sidebar Center */}
          <aside className="col-sm-6 col-lg-3 col-xl-3">
            <Stadiums />

            {/* Video presentation */}
            <div className="panel-box">
              <div className="titles no-margin">
                <h4>Presentation</h4>
              </div>
              <div className="row">
                <iframe
                  src="https://www.youtube.com/embed/8uI6inh2YtM?si=E2giE6V1JcvEZwh2"
                  className="video"
                  title="Presentation Video"
                ></iframe>
                <div className="info-panel">
                  <h4>Cristiano Ronaldo's</h4>
                  <p>
                    Ronaldo's Nerve of Steel: Leading Real Madrid to Glory in 2016 Champions League Final
                  </p>
                </div>
              </div>
            </div>

            {/* Widget img */}
            <div className="panel-box">
              <div className="titles no-margin">
                <h4>Widget Image</h4>
              </div>
              <img
                src="https://html.iwthemes.com/sportscup/run/img/slide/1.jpg"
                alt=""
              />
              <div className="row">
                <div className="info-panel">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                    ut sit amet, consectetur adipisicing elit, labore et
                    dolore.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* content Sidebar Right */}
          <aside className="col-sm-6 col-lg-3 col-xl-2">
            <Diary />

            {/* Adds Sidebar */}
            <div className="panel-box">
              <div className="titles no-margin">
                <h4><i className="fa fa-link"></i>Cta</h4>
              </div>
              <a
                href="https://gowra-stream.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://html.iwthemes.com/sportscup/run/img/adds/sidebar.png"
                  className="img-responsive"
                  alt=""
                />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ContentInfo;
