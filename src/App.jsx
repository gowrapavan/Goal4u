import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import HeroSection from './components/HeroSection';
import ContentInfo from './components/ContentInfo';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import MobileFooter from './components/MobileFooter'; // ✅ Mobile-only footer
import LiveMatch from './components/live/livematch'; // ✅ LiveMatch details page
import Live from './components/live/live'; // ✅ Live match list page
import About from './components/About';
import NotFound404 from "./components/NotFound404"; // your 404 component
import MobileNav from './components/MobileNav'; // ✅ Add this
import ScrollToTop from './components/common/ScrollToTop';



import './App.css';

function App() {
  return (
    <Router>
      {/* ✅ Mmenu nav must be OUTSIDE the #layout */}
      <MobileNav />  {/* ← Move it from Header.jsx to here */}
      <ScrollToTop />


      <div id="layout">
        <Header /> {/* ← No longer contains <MobileNav /> */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <ContentInfo />
                <Newsletter />
              </>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/live" element={<Live />} />
          <Route path="/livematch" element={<LiveMatch />} />
          <Route path="*" element={<NotFound404 />} />
        </Routes>

        <MobileFooter />
        <Footer />
        <div className="footer-down">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <p>&copy; 2018 SportsCup . All Rights Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}


export default App;
