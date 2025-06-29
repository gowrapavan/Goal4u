import React, { useState } from 'react';
import { useNews } from '../hooks/useNews';
import Loading from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import EmptyState from './common/EmptyState';

const LiveNews = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: newsResponse,
    loading,
    error,
    refetch,
  } = useNews(currentPage, 8);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const getImageUrl = (article) => {
    if (article.urlToImage && !article.urlToImage.includes('removed')) {
      return article.urlToImage;
    }
    const fallbackImages = [
      '/assats/img/demonews.png',
    ];
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  };

  const articles = Array.isArray(newsResponse?.articles)
    ? newsResponse.articles
    : [];

  return (
    <div className="panel-box">
      <div className="titles">
        <h4 style={{ paddingTop: '10px' }}>Recent News</h4>
      </div>

      {loading && currentPage === 1 && (
        <Loading message="Loading latest sports news..." />
      )}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={refetch}
          showConfigHelp={error.includes('not configured')}
        />
      )}

      {!loading && !error && articles.length === 0 && (
        <EmptyState
          icon="fa-newspaper-o"
          title="No news available"
          description="No sports news articles are available at the moment."
          action={
            <button onClick={refetch} className="btn btn-primary">
              Refresh News
            </button>
          }
        />
      )}

      <div className="news-grid">
        {articles.map((article, index) => (
          <div
            key={`${article.url}-${index}`}
            className={`post-item news-item ${
              index > 3 ? 'hide-on-mobile' : ''
            }`}
          >
            <div className="img-hover">
              <img
                src={getImageUrl(article)}
                alt={article.title}
                className="news-img"
                onError={(e) =>
                  (e.target.src =
                    '/assets/img/demonews.png')
                }
              />
              <div className="overlay">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  +
                </a>
              </div>
            </div>
            <h5 style={{ paddingTop: '10px' }}>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-title"
              >
                {article.title}
              </a>
            </h5>
            <span className="data-info">
              {formatDate(article.publishedAt)} /{' '}
              <i className="fa fa-user"></i>
              <span className="source-name">{article.source?.name}</span>
            </span>
            <p>
              {article.description?.substring(0, 120)}
              {article.description?.length > 120 ? '...' : ''}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="read-more"
              >
                Read More [+]
              </a>
            </p>
          </div>
        ))}
      </div>

      {newsResponse?.totalResults > articles.length && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn btn-outline-primary"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                Loading More...
              </>
            ) : (
              'Load More News'
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .news-title {
          color: #333;
          text-decoration: none;
          font-weight: 600;
        }
        .news-title:hover {
          color: #007bff;
        }
        .source-name {
          margin-left: 5px;
          font-weight: 500;
        }
        .read-more {
          color: #007bff;
          font-weight: 500;
        }
        .read-more:hover {
          text-decoration: underline;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 20px;
        }

        .post-item {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .img-hover {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }

        .news-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          object-position: top;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .img-hover:hover .news-img {
          transform: scale(1.05);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 123, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .img-hover:hover .overlay {
          opacity: 1;
        }

        .overlay a {
          color: white;
          font-size: 24px;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .news-grid {
            grid-template-columns: 1fr;
          }

          .news-img {
            height: auto;
          }

          .hide-on-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveNews;
