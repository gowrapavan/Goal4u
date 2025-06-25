import React from "react";
import { Link } from "react-router-dom";
import runningGif from "../../public/assets/img/running-player.gif"; // Local or external GIF

const NotFound404 = () => {
  return (
    <section className="py-5 bg-white text-dark">
      <div className="container">
        <div className="row align-items-center justify-content-center">

          {/* GIF Column */}
          <div className="col-md-4 text-center mb-4 mb-md-0">
            <img
              src={runningGif}
              alt="Football Player Running"
              className="img-fluid"
              style={{
                maxWidth: "150px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Text Column */}
          <div className="col-md-6 text-center text-md-left">
            <h1 className="display-3 font-weight-bold text-success">404</h1>
            <h3 className="font-weight-bold mb-3">Oops! Page Not Found</h3>
            <p className="text-muted mb-4" style={{ maxWidth: "500px" }}>
              The page you're looking for might have been removed, renamed, or doesn't exist. Even our striker couldn't find it!
            </p>
            <Link to="/" className="btn btn-success px-4 py-2">
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NotFound404;
