import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, X, Music } from 'lucide-react';

export function MiniPlayer({ track, onClose }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (track && track.preview_url && audioRef.current) {
      audioRef.current.src = track.preview_url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [track]);

  if (!track || !track.preview_url) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="mini-player">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      <div className="player-info">
        <img src={track.cover_url} alt="" className="player-thumb" />
        <div className="player-text">
          <span className="player-title">{track.track_name}</span>
          <span className="player-artist">{track.artist_name || track.album_title}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="player-btn" onClick={togglePlay}>
          {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
