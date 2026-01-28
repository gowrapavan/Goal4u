import React from 'react';
import { useNews } from '../../../hooks/MatchNews';
import Loading from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import EmptyState from '../../common/EmptyState';

const COMPETITIONS = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

const MatchNews = ({ matchTitle }) => {
  const compCodeMatch = matchTitle?.match(/\b([A-Z]{2,4})\b/); // e.g., CWC
  const compCode = compCodeMatch?.[1];
  const competitionName = COMPETITIONS.find(c => c.code === compCode)?.name || '';

  const cleanedTitle = matchTitle.replace(/\b([A-Z]{2,4})\b/, '').trim();

  // 🟡 Updated: use quoted search query to reduce irrelevant matches
  const searchQuery = competitionName
    ? `"${cleanedTitle} ${competitionName}"`
    : `"${matchTitle}"`;

  const {
    data: newsResponse,
    loading,
    error,
    refetch,
  } = useNews(1, 6, searchQuery);

  const articles = Array.isArray(newsResponse?.articles) ? newsResponse.articles : [];

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const getImageUrl = (article, i) =>
    article.urlToImage && !article.urlToImage.includes('removed')
      ? article.urlToImage
      : `/assets/img/demonews.png`;

  return (
    <div className="panel-box">
      <div className="titles">
        <h4 style={{ paddingTop: '10px' }}>Match News</h4>
      </div>

      {loading && <Loading message="Loading match news..." />}

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
          title="No match news found"
          description={`No news articles found for ${searchQuery}.`}
          action={
            <button onClick={refetch} className="btn btn-primary">
              Try Again
            </button>
          }
        />
      )}

      <div className="news-grid">
        {articles.map((article, index) => (
          <div key={index} className="post-item news-item">
            <div className="img-hover">
              <img
                src={getImageUrl(article, index)}
                alt={article.title}
                className="news-img"
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

export default MatchNews;
