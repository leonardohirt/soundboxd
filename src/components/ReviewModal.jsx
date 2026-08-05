import React, { useState, useEffect } from 'react';
import { X, Heart, RotateCcw, Calendar, Save } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StarRating } from './StarRating';

export function ReviewModal({ album, existingReview, onClose, onSaveReview }) {
  const [rating, setRating] = useState(existingReview?.rating || 4.0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [listenedDate, setListenedDate] = useState(
    existingReview?.listened_date || new Date().toISOString().split('T')[0]
  );
  const [isRelisten, setIsRelisten] = useState(existingReview?.is_relisten || false);
  const [isFavorite, setIsFavorite] = useState(existingReview?.is_favorite || false);

  if (!album) return null;

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (newRating === 5.0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reviewData = {
      id: existingReview?.id || 'rev-' + Date.now(),
      album_id: album.album_id,
      album_title: album.album_title,
      artist_name: album.artist_name,
      cover_url: album.cover_url,
      release_year: album.release_year,
      genre: album.genre,
      rating,
      review_text: reviewText,
      listened_date: listenedDate,
      is_relisten: isRelisten,
      is_favorite: isFavorite,
      created_at: existingReview?.created_at || new Date().toISOString()
    };

    onSaveReview(reviewData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
            {existingReview ? 'Editar Avaliação' : 'Registrar no Diário'}
          </h3>
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

        {/* Mini Header of Album */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
          <img src={album.cover_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{album.album_title}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-green)' }}>{album.artist_name}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Star Rating picker */}
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
              SUA NOTA
            </label>
            <StarRating rating={rating} onRatingChange={handleRatingChange} size={28} />
          </div>

          {/* Review Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
              SUA RESENHA (OPCIONAL)
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="O que você achou deste álbum? Escreva sua opinião..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Options Row: Date, Relisten, Favorite */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="var(--text-muted)" />
              <input
                type="date"
                value={listenedDate}
                onChange={(e) => setListenedDate(e.target.value)}
                style={{
                  background: '#14181c',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsRelisten(!isRelisten)}
                style={{
                  background: isRelisten ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: isRelisten ? '1px solid var(--color-cyan)' : '1px solid var(--border-color)',
                  color: isRelisten ? 'var(--color-cyan)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} /> Re-ouviu
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                style={{
                  background: isFavorite ? 'rgba(255, 77, 109, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: isFavorite ? '1px solid #ff4d6d' : '1px solid var(--border-color)',
                  color: isFavorite ? '#ff4d6d' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Heart size={14} fill={isFavorite ? '#ff4d6d' : 'none'} /> Favorito
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            <Save size={18} />
            <span>Salvar no Diário</span>
          </button>
        </form>
      </div>
    </div>
  );
}
