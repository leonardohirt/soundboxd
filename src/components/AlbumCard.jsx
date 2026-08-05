import React from 'react';
import { Star } from 'lucide-react';

export function AlbumCard({ album, review, onClick }) {
  const rating = review ? review.rating : album.user_rating;

  return (
    <div className="album-card" onClick={() => onClick(album)}>
      <img
        src={album.cover_url}
        alt={album.album_title}
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x600/121518/ffffff?text=Música';
        }}
      />
      {rating && (
        <div className="rating-badge">
          <Star size={10} fill="#ffb703" color="#ffb703" />
          <span>{Number(rating).toFixed(1)}</span>
        </div>
      )}
      <div className="album-card-overlay">
        <div className="album-card-title">{album.album_title}</div>
        <div className="album-card-artist">{album.artist_name}</div>
      </div>
    </div>
  );
}
