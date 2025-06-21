// components/Youtube.jsx
import React from 'react';

const Youtube = () => {
  const videoIds = ["Ln8rXkeeyP0", "Z5cackyUfgk", "hW3hnUoUS0k"];

  return (
    <div className="row no-line-height">
      <div className="col-md-12">
        <h3 className="clear-title">Match Videos</h3>
      </div>
      {videoIds.map((id, i) => (
        <div className="col-lg-6 col-xl-4" key={i}>
          <div className="panel-box">
            <div className="titles no-margin">
              <h4><a href="#">Video Title {i + 1}</a></h4>
            </div>
            <iframe
              className="video"
              src={`https://www.youtube.com/embed/${id}`}
              frameBorder="0"
              allow="encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Youtube;
