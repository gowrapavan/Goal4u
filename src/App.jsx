import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContentInfo from './components/ContentInfo';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import MobileFooter from './components/MobileFooter';
import LiveMatch from './components/live/livematch';
import Live from './components/live/live';
import FixturesPage from './components/Fixture';
import About from './components/About';
import Bracket from './components/Bracket';
import NotFound404 from './components/NotFound404';
import MobileNav from './components/MobileNav';
import LiveTV from './components/live/LiveTv';
import ScrollToTop from './components/common/ScrollToTop';
import FloatButton from './components/common/FloatButton'; // ✅ NEW

import './App.css';

function App() {
  return (
    <Router>
      <MobileNav />
      <ScrollToTop />

      <div id="layout">
        <Header />
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
          <Route path="/livetv" element={<LiveTV />} />
          <Route path="/about" element={<About />} />
          <Route path="/live" element={<Live />} />
          <Route path="/livematch" element={<LiveMatch />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/bracket" element={<Bracket />} />
          <Route path="*" element={<NotFound404 />} />
        </Routes>

        <MobileFooter />
        <Footer />
        <FloatButton /> {/* ✅ Floating live button */}
      </div>
    </Router>
  );
}

export default App;
