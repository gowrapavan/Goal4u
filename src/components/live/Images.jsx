import React, { useEffect, useState } from 'react';

const IMAGES_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/images/';

const Images = ({ matchId, competition }) => {
  const [matchImages, setMatchImages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId || !competition) return;

    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      setMatchImages(null);

      try {
        const compFile = `${competition?.toUpperCase()}.json`;
        const res = await fetch(`${IMAGES_BASE_URL}${compFile}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const images = data.find(m => String(m.GameId) === String(matchId));
        if (!images) {
          setError('No images found for this match.');
        } else {
          setMatchImages(images);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [matchId, competition]);

  if (loading) return <p style={{ color: '#aaa' }}>Loading images…</p>;
  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!matchImages) return null;

  const { HomeTeamImages, AwayTeamImages } = matchImages;

  const imageContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  };

  const imgStyle = {
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    objectFit: 'cover',
    maxWidth: '20%',
    height: 'auto',
  };

  return (
    <div style={{ marginTop: '1rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Home Team Images */}
      {HomeTeamImages?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#f5f5f5', textAlign: 'center', marginBottom: '0.5rem' }}>
            Home Team Images
          </h3>
          <div style={imageContainerStyle}>
            {HomeTeamImages.map((img, idx) => (
              <img key={idx} src={img} alt={`Home ${idx + 1}`} style={imgStyle} />
            ))}
          </div>
        </div>
      )}

      {/* Away Team Images */}
      {AwayTeamImages?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#f5f5f5', textAlign: 'center', marginBottom: '0.5rem' }}>
            Away Team Images
          </h3>
          <div style={imageContainerStyle}>
            {AwayTeamImages.map((img, idx) => (
              <img key={idx} src={img} alt={`Away ${idx + 1}`} style={imgStyle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Images;
