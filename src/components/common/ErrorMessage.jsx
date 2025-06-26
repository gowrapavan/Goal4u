import React from 'react';
import { Link } from 'react-router-dom';
import errorGif from '../../../public/assets/img/running-player.gif'; // optional gif reuse

const ErrorMessage = ({ message, onRetry, showConfigHelp = false }) => {
  return (
    <section className="py-5 bg-white text-dark">
      <div className="container">
        <div className="row align-items-center justify-content-center">

          {/* GIF Column */}
          <div className="col-md-4 text-center mb-4 mb-md-0">
            <img
              src={errorGif}
              alt="Error Illustration"
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
            <h1 className="display-4 font-weight-bold text-danger">Oops!</h1>
            <h4 className="font-weight-bold mb-3">Something went wrong</h4>
            <p className="text-muted mb-3" style={{ maxWidth: "500px" }}>
              {message || "We couldn’t load the content. Please check your connection or try again."}
            </p>

            {showConfigHelp && (
              <div className="alert alert-warning text-left mt-3">
                <h6 className="font-weight-bold mb-2">Setup Instructions:</h6>
                <ol className="pl-3 mb-2">
                  <li>Copy <code>.env.example</code> to <code>.env</code></li>
                  <li>Get your API keys from the respective services</li>
                  <li>Add your API keys to the <code>.env</code> file</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}

            <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-md-start mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="btn btn-outline-danger px-4 py-2"
                >
                  Try Again
                </button>
              )}
              <Link to="/" className="btn btn-success px-4 py-2">
                Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ErrorMessage;
