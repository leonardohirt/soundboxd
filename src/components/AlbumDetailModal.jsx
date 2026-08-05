import React, { useState, useEffect } from 'react';
import { X, Play, Pause, PlusCircle, ExternalLink, Calendar, Music, Disc, Heart } from 'lucide-react';
import { getAlbumDetails } from '../services/musicApi';
import { StarRating } from './StarRating';
import { fetchTrackRatings, saveTrackRating } from '../services/supabase';

export function AlbumDetailModal({ album, userReview, onClose, onOpenReview, onPlayTrack, currentPlayingTrack }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackRatings, setTrackRatings] = useState({});

  useEffect(() => {
    if (album?.album_id) {
      setLoading(true);
      Promise.all([
        getAlbumDetails(album.album_id),
        fetchTrackRatings(album.album_id)
      ]).then(([resDetails, resRatings]) => {
        setDetails(resDetails || album);
        setTrackRatings(resRatings || {});
        setLoading(false);
      });
    }
  }, [album]);

  if (!album) return null;
  const albumData = details || album;

  const handleRateTrack = async (track, newRating) => {
    const key = `${albumData.album_id}_${track.track_id}`;
    const current = trackRatings[key] || {};
    const updatedData = {
      album_id: String(albumData.album_id),
      track_id: String(track.track_id),
      track_name: track.track_name,
      artist_name: albumData.artist_name,
      rating: newRating,
      is_favorite: Boolean(current.is_favorite)
    };
    
    setTrackRatings(prev => ({
      ...prev,
      [key]: updatedData
    }));

    await saveTrackRating(updatedData);
  };

  const handleToggleFavoriteTrack = async (track) => {
    const key = `${albumData.album_id}_${track.track_id}`;
    const current = trackRatings[key] || {};
    const updatedData = {
      album_id: String(albumData.album_id),
      track_id: String(track.track_id),
      track_name: track.track_name,
      artist_name: albumData.artist_name,
      rating: current.rating || 5.0,
      is_favorite: !current.is_favorite
    };

    setTrackRatings(prev => ({
      ...prev,
      [key]: updatedData
    }));

    await saveTrackRating(updatedData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" style={{ maxHeight: '88vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>

        {/* Close Button Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700 }}>
            Detalhes do Álbum
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Album Hero Info */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <img
            src={albumData.cover_url}
            alt={albumData.album_title}
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              flexShrink: 0
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: '1.25', color: '#fff', marginBottom: '4px' }}>
              {albumData.album_title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-green)', fontWeight: 600, marginBottom: '8px' }}>
              {albumData.artist_name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {albumData.release_year}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Music size={12} /> {albumData.genre}
              </span>
            </div>

            {userReview && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StarRating rating={userReview.rating} readonly size={14} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(Nota do álbum)</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <button className="btn-primary" onClick={() => onOpenReview(albumData)}>
            <PlusCircle size={18} />
            <span>{userReview ? 'Editar Resenha' : 'Avaliar Álbum'}</span>
          </button>
          
          <a
            href={albumData.spotify_url || `https://open.spotify.com/search/${encodeURIComponent(albumData.artist_name + ' ' + albumData.album_title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-spotify"
            style={{ justifyContent: 'center' }}
          >
            <Disc size={16} />
            <span>Ouvir no Spotify</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Tracklist Section with Individual Track Rating */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Avaliar Faixas Individuais ({albumData.tracks ? albumData.tracks.length : '...'})
            </h3>
            <span style={{ fontSize: '10px', color: 'var(--color-green)', fontWeight: 600 }}>
              Toque nas estrelas para avaliar cada música
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Carregando faixas...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {albumData.tracks && albumData.tracks.length > 0 ? (
                albumData.tracks.map((track) => {
                  const isPlaying = currentPlayingTrack?.track_id === track.track_id;
                  const trackKey = `${albumData.album_id}_${track.track_id}`;
                  const currentTrackData = trackRatings[trackKey] || {};
                  const trackRating = currentTrackData.rating || 0;
                  const isFav = currentTrackData.is_favorite || false;

                  return (
                    <div
                      key={track.track_id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '10px 12px',
                        background: isPlaying ? 'rgba(0, 224, 84, 0.1)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        border: isPlaying ? '1px solid var(--color-green)' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                            {track.track_number}
                          </span>
                          <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '13px', fontWeight: isPlaying ? 700 : 600, color: isPlaying ? 'var(--color-green)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {track.track_name}
                            </p>
                          </div>
                        </div>

                        {track.preview_url && (
                          <button
                            onClick={() => onPlayTrack({ ...track, album_title: albumData.album_title, cover_url: albumData.cover_url })}
                            style={{
                              background: isPlaying ? 'var(--color-green)' : 'rgba(255,255,255,0.1)',
                              color: isPlaying ? '#000' : '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            {isPlaying ? <Pause size={14} fill="#000" /> : <Play size={14} style={{ marginLeft: '2px' }} />}
                          </button>
                        )}
                      </div>

                      {/* Track Rating Controls Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Sua nota:</span>
                          <StarRating
                            rating={trackRating}
                            onRatingChange={(val) => handleRateTrack(track, val)}
                            size={14}
                          />
                        </div>

                        <button
                          onClick={() => handleToggleFavoriteTrack(track)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isFav ? '#ff4d6d' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          <Heart size={14} fill={isFav ? '#ff4d6d' : 'none'} />
                          <span>{isFav ? 'Destaque' : 'Favoritar'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nenhuma faixa disponível.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
