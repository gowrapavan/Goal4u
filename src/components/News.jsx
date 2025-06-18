import React, { useState } from 'react';
import { useNews } from '../hooks/useNews'; // Or your working hook
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import EmptyState from './common/EmptyState';

const News = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: newsResponse,
    loading,
    error,
    refetch,
  } = useNews(currentPage, 8); // ✅ working API

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
      'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
      'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
      'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
      'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg',
    ];
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  };

  // ✅ fix: access flat array safely
  const articles = Array.isArray(newsResponse?.articles)
    ? newsResponse.articles
    : [];

  return (
    <div className="panel-box">
      <div className="titles">
        <h4>Recent News</h4>
      </div>

      {loading && currentPage === 1 && (
        <LoadingSpinner message="Loading latest sports news..." />
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

      {/* ✅ Working News List */}
      {articles.map((article, index) => (
        <div key={`${article.url}-${index}`} className="post-item">
          <div className="row">
            <div className="col-md-4">
              <div className="img-hover">
                <img
                  src={getImageUrl(article)}
                  alt={article.title}
                  className="img-responsive"
                  onError={(e) =>
                    (e.target.src =
                      'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg')
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
            </div>
            <div className="col-md-8">
              <h5>
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
                {formatDate(article.publishedAt)} /
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
          </div>
        </div>
      ))}

      {/* ✅ Load More (working) */}
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
        .post-item {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .img-hover {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }
        .img-hover img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .img-hover:hover img {
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
      `}</style>
    </div>
  );
};

export default News;
