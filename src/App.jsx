import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import {
  initGA,
  trackPageView
} from './services/gmanger-tag/GA_Measurement'; // ✅ Import from config

// Components
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
import FloatButton from './components/common/FloatButton';
import PlayersByClub from './components/Player';
import Team from './components/team/Team';
import TeamProfile from './components/team/TeamProfile';
import LaLiga from "./pages/leagues/LaLiga";
import Standings from "./pages/leagues/Standings";
import MultipleTV from "./pages/TV/MultipleTV";
import Koora from './components/koora';

import './App.css';

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
}

function AppWrapper() {
  usePageTracking();

  return (
    <>
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
          <Route path="/MultipleTV" element={<MultipleTV />} />
          <Route path="/players" element={<PlayersByClub />} />
          <Route path="/koora" element={<Koora />} />
          <Route path="/livetv" element={<LiveTV />} />
          <Route path="/about" element={<About />} />
          <Route path="/live" element={<Live />} />
          <Route path="/clubs" element={<Team />} />
          <Route path="/club" element={<TeamProfile />} />
          <Route path="/livematch" element={<LiveMatch />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/bracket" element={<Bracket />} />
          <Route path="*" element={<NotFound404 />} />
          <Route path="/league/laliga" element={<LaLiga />} />
          <Route path="/league/standings" element={<Standings />} />
        </Routes>
        <MobileFooter />
        <Footer />
        <FloatButton />
      </div>
    </>
  );
}

function App() {
  useEffect(() => {
    initGA(); // ✅ Initialize GA on first load
  }, []);

  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
