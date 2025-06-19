import React, { useState, useEffect } from 'react';
import { useNews } from '../hooks/useNews';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: newsResponse, loading, error } = useNews(1, 20); // Fetch up to 20

  const hardcodedSlide = {
    title: 'Premier League Action',
    description:
      'Follow the latest matches, standings, and player performances from the world\'s most exciting football league.',
    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
    url: '#',
  };

  const [slides, setSlides] = useState([hardcodedSlide]);

  useEffect(() => {
    if (newsResponse?.articles && newsResponse.articles.length > 0) {
      const dynamicSlides = newsResponse.articles
        .slice(0, 10)
        .map((article) => ({
          title: article.title,
          description:
            article.description?.substring(0, 150) +
            (article.description?.length > 150 ? '...' : ''),
          image:
            article.urlToImage && !article.urlToImage.includes('removed')
              ? article.urlToImage
              : hardcodedSlide.image,
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

  const handleReadMore = (url) => {
    if (url && url !== '#') window.open(url, '_blank');
  };

  return (
    <div className="hero-header">
      <div className="hero-slider">
        <div
          className="slider-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="item-slider"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${slide.image})`,
              }}
            >
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <div className="info-slider">
                      <h1>{slide.title}</h1>
                      <p>{slide.description}</p>
                      <button
                        onClick={() => handleReadMore(slide.url)}
                        className="btn-iw outline"
                      >
                        Read More <i className="fa fa-long-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
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

      {/* Styling */}
      <style jsx>{`
        .hero-header {
          position: relative;
          height: 700px; /* Increased height */
          overflow: hidden;
        }

        .hero-slider {
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .slider-track {
          display: flex;
          height: 100%;
          transition: transform 0.9s ease-in-out;
        }

        .item-slider {
          flex: 0 0 100%;
          height: 100%;
          background-position: center;
          background-size: cover;
          display: flex;
          align-items: center;
        }

        .info-slider h1 {
          font-size: 3rem;
          font-weight: bold;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
        }

        .info-slider p {
          font-size: 1.2rem;
          color: white;
          margin-bottom: 2rem;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }

        .btn-iw.outline {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 12px 30px;
          font-weight: 600;
        }

        .btn-iw.outline:hover {
          background: white;
          color: #333;
        }

        .hero-indicators {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
          cursor: pointer;
        }

        .indicator.active {
          background: black;
        }

        .hero-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.4);
          border: none;
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          cursor: pointer;
        }

        .hero-nav.prev {
          left: 20px;
        }

        .hero-nav.next {
          right: 20px;
        }

        @media (max-width: 768px) {
        .hero-header {
          height: 550px;
        }

        .info-slider {
          margin-top: 60px; /* Moves text down */
          text-align: left; /* Optional: center align for better mobile look */
          padding: 0 15px; /* Optional: horizontal padding for small screens */
        }

        .info-slider h1 {
          font-size: 0.3 rem; /* Reduced font size */
          line-height: 1.3;
        }

        .info-slider p {
          font-size: 0.7 rem;
          line-height: 1.4;
        }

        .btn-iw.outline {
          padding: 8px 20px; /* Smaller button */
          font-size: 0.7rem;
        }

        .hero-nav {
          width: 36px;
          height: 36px;
        }
      }

      `}</style>
    </div>
  );
};

export default HeroSection;
