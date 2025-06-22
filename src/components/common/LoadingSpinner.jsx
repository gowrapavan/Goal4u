import React from 'react';

const Loading = () => {
  return (
    <>
      <div className="loading-wrapper">
        <div className="fancy-loader"></div>
      </div>

      <style jsx>{`
        .loading-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px; /* Adjust height as needed */
          width: 100%;
        }

        .fancy-loader {
          width: 44.8px;
          height: 44.8px;
          color: rgb(87, 181, 76);
          position: relative;
          background: radial-gradient(11.2px, currentColor 94%, #0000);
        }

        .fancy-loader::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background:
            radial-gradient(10.08px at bottom right, #0000 94%, currentColor) top left,
            radial-gradient(10.08px at bottom left, #0000 94%, currentColor) top right,
            radial-gradient(10.08px at top right, #0000 94%, currentColor) bottom left,
            radial-gradient(10.08px at top left, #0000 94%, currentColor) bottom right;
          background-size: 22.4px 22.4px;
          background-repeat: no-repeat;
          animation: fancy-loader-spin 0.5s infinite cubic-bezier(0.3, 1, 0, 1);
        }

        @keyframes fancy-loader-spin {
          33% {
            inset: -11.2px;
            transform: rotate(0deg);
          }
          66% {
            inset: -11.2px;
            transform: rotate(90deg);
          }
          100% {
            inset: 0;
            transform: rotate(90deg);
          }
        }
      `}</style>
    </>
  );
};

export default Loading;
