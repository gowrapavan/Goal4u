import React, { useState, useEffect } from 'react';
import { useNews } from '../hooks/useNews';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: newsResponse } = useNews(1, 20);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ Update on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Separate desktop and mobile images
  const hardcodedSlide = {
    title: 'Welcome to GOAL4U',
    desktopImage: '/assets/img/yt.png',
    mobileImage: '/assets/img/yt-mb.png',
    url: '/about',
  };

  const [slides, setSlides] = useState([hardcodedSlide]);

  useEffect(() => {
    if (newsResponse?.articles && newsResponse.articles.length > 0) {
      const dynamicSlides = newsResponse.articles.slice(0, 50).map((article) => ({
        title: article.title,
        image:
          article.urlToImage && !article.urlToImage.includes('removed')
            ? article.urlToImage
            : hardcodedSlide.desktopImage,
        url: article.url,
      }));

      setSlides([hardcodedSlide, ...dynamicSlides]);
    }
  }, [newsResponse]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const handleReadMore = (url, index) => {
    if (!url) return;
    if (index === 0) {
      // hardcoded slide: open in same tab
      window.location.href = url;
    } else {
      // dynamic slides: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div className="hero-header">
      <div className="hero-slider">
        <div
          className="slider-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const image = index === 0
              ? isMobile ? slide.mobileImage : slide.desktopImage
              : slide.image;

            return (
              <div
                key={index}
                className="item-slider"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${image})`,
                }}
              >
                <div className="container">
                  <br />
                  <br />
                  <br />
                  <div className="row align-items-center">
                    <div className="col-lg-8">
                      <div className="info-slider">
                        <h1>{slide.title}</h1>
                        <button
                          onClick={() => handleReadMore(slide.url, index)}
                          className="btn-iw outline"
                        >
                          {index === 0 ? 'Explore' : 'Read More'}{' '}
                          <i className="fa fa-long-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicators - hidden on mobile */}
        <div className="hero-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          className="hero-nav prev"
          onClick={() =>
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
          }
        >
          <i className="fa fa-chevron-left"></i>
        </button>
        <button
          className="hero-nav next"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        >
          <i className="fa fa-chevron-right"></i>
        </button>
      </div>

      <style jsx>{`
        .hero-header {
          position: relative;
          height: 600px;
          overflow: hidden;
          background-color: lightgreen;
        }

        .hero-slider {
          height: 100%;
          overflow: hidden;
          position: relative;
          border-radius: 5px;
        }

        .slider-track {
          display: flex;
          height: 100%;
          transition: transform 0.8s ease-in-out;
        }

        .item-slider {
          flex: 0 0 100%;
          height: 100%;
          background-position: center;
          background-size: cover;
          display: flex;
          align-items: center;
        }

        .info-slider {
          padding: 0 20px;
        }

        .info-slider h1 {
          font-size: 1.1rem;
          color: white;
          font-weight: 600;
          margin-bottom: 1rem;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }

        .btn-iw.outline {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 8px 18px;
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 4px;
        }

        .btn-iw.outline:hover {
          background: white;
          color: black;
        }

        .hero-indicators {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
        }

        .indicator {
          width: 20px;
          height: 5px;
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
        }

        .indicator.active {
          width: 28px;
          background-color: #06a33f;
        }

        .hero-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.4);
          border: none;
          color: lightgreen;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
        }

        .hero-nav.prev {
          left: 15px;
        }

        .hero-nav.next {
          right: 15px;
        }

        @media (max-width: 768px) {
          .hero-header {
            height: 420px;
          }

          .info-slider h1 {
            font-size: 0.9rem;
            line-height: 1.3;
          }

          .btn-iw.outline {
            font-size: 0.7rem;
            padding: 6px 12px;
          }

          .hero-indicators {
            display: none;
          }

          .hero-nav {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
