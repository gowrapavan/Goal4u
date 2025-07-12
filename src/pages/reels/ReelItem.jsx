import React, { useEffect } from "react";

const ReelItem = ({ src, type }) => {
  useEffect(() => {
    if (type === "instagram") {
      const script = document.createElement("script");
      script.setAttribute("src", "https://www.instagram.com/embed.js");
      script.async = true;
      document.body.appendChild(script);
    }
  }, [type]);

  if (type === "youtube") {
    return (
      <iframe
        src={src}
        allow="autoplay; encrypted-media"
        allowFullScreen
        frameBorder="0"
        loading="lazy"
      />
    );
  }

  if (type === "instagram") {
  return (
    <div className="instagram-wrapper">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={src}
        data-instgrm-version="14"
        style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}
      ></blockquote>
    </div>
  );
}


  if (type === "self") {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return null;
};

export default ReelItem;
