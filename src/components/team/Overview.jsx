import React from "react";

const Overview = () => {
  return (
    <div className="tab-pane active" id="overview">
      <div className="panel-box padding-b">
        <div className="titles">
          <h4>Colombia national football team</h4>
        </div>
        <div className="row">
          <div className="col-lg-12 col-xl-4">
            <img src="img/clubs-teams/single-team.jpg" alt="" />
          </div>

          <div className="col-lg-12 col-xl-8">
            <p>
              The Colombia national football team (Spanish: Selección de fútbol de
              Colombia) represents Colombia in international football
              competitions and is overseen by the Colombian Football Federation.
              It is a member of the CONMEBOL and is currently ranked thirteenth
              in the FIFA World Rankings. The team are nicknamed Los Cafeteros
              due to the coffee production in their country.
            </p>

            <p>
              Since the mid-1980s, the national team has been a symbol fighting
              the country's negative reputation. This has made the sport popular
              and made the national team a sign of nationalism, pride and
              passion for many Colombians worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Club News */}
      <div className="row">
        <div className="col-md-12">
          <h3 className="clear-title">Latest Club News</h3>
        </div>

        {[1, 2, 3].map((item, i) => (
          <div className="col-lg-6 col-xl-4" key={i}>
            <div className="panel-box">
              <div className="titles no-margin">
                <h4>
                  <a href="#">
                    {item === 1
                      ? "World football's dates."
                      : item === 2
                      ? "Mbappe’s year to remember"
                      : "Egypt are one family"}
                  </a>
                </h4>
              </div>
              <a href="#">
                <img src={`img/blog/${item}.jpg`} alt="" />
              </a>
              <div className="row">
                <div className="info-panel">
                  <p>
                    {item === 1
                      ? "Fans from all around the world can apply for 2018 FIFA World Cup™ tickets as the first window of sales."
                      : item === 2
                      ? "Tickets may be purchased online by using Visa payment cards or Visa Checkout. Visa is the official."
                      : "Successful applicants who have applied for supporter tickets and conditional supporter tickets will."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Club Videos */}
      <div className="row no-line-height">
        <div className="col-md-12">
          <h3 className="clear-title">Latest Club Videos</h3>
        </div>

        {[{
          title: "Eliminatory to the world.",
          video: "https://www.youtube.com/embed/Ln8rXkeeyP0"
        }, {
          title: "Colombia classification",
          video: "https://www.youtube.com/embed/Z5cackyUfgk"
        }, {
          title: "World Cup goal",
          video: "https://www.youtube.com/embed/hW3hnUoUS0k"
        }].map((v, i) => (
          <div className="col-lg-6 col-xl-4" key={i}>
            <div className="panel-box">
              <div className="titles no-margin">
                <h4><a href="#">{v.title}</a></h4>
              </div>
              <iframe
                className="video"
                src={v.video}
                frameBorder="0"
                allow="encrypted-media"
                allowFullScreen
                title={v.title}
              ></iframe>
            </div>
          </div>
        ))}
      </div>


     
    </div>
  );
};

export default Overview;
