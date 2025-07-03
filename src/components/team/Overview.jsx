import React from "react";

const Overview = ({ teamData }) => {
  if (!teamData) return null;

  const {
    Name,
    FullName,
    Nickname1,
    Nickname2,
    Nickname3,
    AreaName,
    Founded,
    VenueName,
    Type,
    WikipediaLogoUrl
  } = teamData;

  // Dynamic descriptive paragraph generation
  const summary1 = `${FullName || Name}${
    Nickname1 ? `, commonly known as "${Nickname1}"` : ""
  }, is a ${Type?.toLowerCase() || "football"} team based in ${AreaName || "an unknown country"}.${
    Founded ? ` Founded in ${Founded}` : ""
  }, they play their home matches at ${VenueName || "an unknown stadium"}.`;

  const summary2 = `The team is overseen by the ${AreaName} Football Association and is widely recognized for its contribution to international and domestic competitions. ${
    Nickname2 ? `They are also referred to as "${Nickname2}". ` : ""
  }The club holds a special place in the hearts of fans, symbolizing pride and footballing excellence in ${AreaName || "their nation"}.`;

  return (
    <div className="tab-pane active" id="overview">
      <div className="panel-box padding-b">
        <div className="titles">
          <h4>{Name}</h4>
        </div>
        <div className="row">
          <div className="col-lg-12 col-xl-4">
            <img
              src={WikipediaLogoUrl || "assets/img/demonews.png"}
              alt={Name}
              style={{
    width: "190px",
    height: "150px",
    objectFit: "contain",
    borderRadius: "8px",
    display: "block",
    margin: "0 auto"
  }}

            />
          </div>

          <div className="col-lg-12 col-xl-8">
            <p>{summary1}</p>
            <p>{summary2}</p>
          </div>
        </div>
      </div>

      {/* Latest Club News - Optional Static */}
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
                      ? "Fans from around the world can apply for World Cup tickets."
                      : item === 2
                      ? "Mbappe dominated headlines in a breakthrough season."
                      : "Egypt’s unity shows the strength of their national team."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optional Static Club Videos */}
      <div className="row no-line-height">
        <div className="col-md-12">
          <h3 className="clear-title">Latest Club Videos</h3>
        </div>

        {[
          { title: "Eliminatory to the world.", video: "https://www.youtube.com/embed/Ln8rXkeeyP0" },
          { title: "Colombia classification", video: "https://www.youtube.com/embed/Z5cackyUfgk" },
          { title: "World Cup goal", video: "https://www.youtube.com/embed/hW3hnUoUS0k" },
        ].map((v, i) => (
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
