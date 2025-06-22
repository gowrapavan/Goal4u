// components/MatchNews.jsx
import React, { useEffect, useState } from 'react';
import { newsAPI } from '../../services/newsApi';

const MatchNews = ({ matchTitle }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const keywords = newsAPI.extractKeywords(matchTitle);
        const news = await newsAPI.getRelatedNews(keywords, matchTitle, 4);
        setArticles(newsAPI.filterArticles(news));
      } catch (err) {
        setError(err.message || 'Failed to fetch related news');
      } finally {
        setLoading(false);
      }
    };

    if (matchTitle) fetchNews();
  }, [matchTitle]);

  if (loading) return <p>Loading match news...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (articles.length === 0) return <p>No match news found.</p>;

  return (
    <div className="row">
      <div className="col-md-12">
        <h3 className="clear-title">Match News</h3>
      </div>
      {articles.map((article, i) => (
        <div className="col-lg-6 col-xl-3" key={i}>
          <div className="panel-box">
            <div className="titles no-margin">
              <h4>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h4>
            </div>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <img
                src={article.urlToImage || `https://source.unsplash.com/random/300x200?football&sig=${i}`}
                alt="news"
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </a>
            <div className="row">
              <div className="info-panel">
                <p>{article.description?.slice(0, 100)}...</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchNews;
