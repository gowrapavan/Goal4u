// GA_Measurement.js
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-R6LPS94W2G'; // ✅ Your Google Analytics ID

// Initialize Google Analytics
export const initGA = () => {
  ReactGA.initialize(GA_MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};
