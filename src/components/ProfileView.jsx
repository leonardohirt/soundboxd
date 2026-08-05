import React, { useState } from 'react';
import { User, Edit3, Heart, Star, Disc, Music, BarChart2, BookOpen, Clock, Award, Filter, Sparkles } from 'lucide-react';
import { AlbumCard } from './AlbumCard';
import { StarRating } from './StarRating';

export function ProfileView({ profile, reviews, onSelectAlbum, onOpenEditProfile }) {
  const [subTab, setSubTab] = useState('stats'); // 'stats' | 'reviews' | 'favorites'
  const [reviewSearch, setReviewSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'rating_desc' | 'rating_asc'

  // Computing stats
  const totalAlbums = reviews.length;
  const avgRating = totalAlbums > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalAlbums).toFixed(1)
    : '0.0';
  const favoriteAlbums = reviews.filter(r => r.is_favorite);
  const totalHours = Math.round(totalAlbums * 0.75); // Est. 45 min per album

  // Rating distribution bar chart data (1 to 5 stars)
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const rounded = Math.round(r.rating || 0);
    if (rounded >= 1 && rounded <= 5) {
      ratingCounts[rounded] += 1;
    }
  });
  const maxRatingCount = Math.max(...Object.values(ratingCounts), 1);

  // Genre breakdown
  const genreCounts = {};
  reviews.forEach(r => {
    const genre = r.genre || 'Música';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Artist breakdown
  const artistCounts = {};
  reviews.forEach(r => {
    const artist = r.artist_name || 'Desconhecido';
    artistCounts[artist] = (artistCounts[artist] || 0) + 1;
  });
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Filter & sort user reviews
  let filteredReviews = reviews.filter(r =>
    r.album_title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.artist_name.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  if (sortBy === 'rating_desc') {
    filteredReviews.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'rating_asc') {
    filteredReviews.sort((a, b) => a.rating - b.rating);
  } else {
    filteredReviews.sort((a, b) => new Date(b.created_at || b.listened_date) - new Date(a.created_at || a.listened_date));
  }

  // Top 4 Letterboxd-style pinned albums
  const topFour = favoriteAlbums.slice(0, 4);

  return (
    <div>
      {/* Profile Header Card */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(25, 29, 33, 0.95) 0%, rgba(18, 21, 24, 0.98) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Edit button top right */}
        <button
          onClick={onOpenEditProfile}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Edit3 size={14} color="var(--color-green)" />
          <span>Editar Perfil</span>
        </button>

        {/* Profile Avatar & Names */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--color-green)',
                boxShadow: '0 0 20px var(--color-green-glow)'
              }}
            />
          ) : (
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-green), var(--color-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
              color: '#000',
              boxShadow: '0 0 20px var(--color-green-glow)'
            }}>
              {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'SB'}
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              {profile?.full_name || 'Usuário Soundboxd'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: 600, marginTop: '2px' }}>
              @{profile?.username || 'ouvinte'}
            </p>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
            {profile.bio}
          </p>
        )}

        {/* Badges: Favorite artist & genre */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {profile?.favorite_artist && (
            <span style={{ background: 'rgba(0, 224, 84, 0.12)', border: '1px solid rgba(0, 224, 84, 0.3)', color: 'var(--color-green)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Disc size={12} /> {profile.favorite_artist}
            </span>
          )}
          {profile?.favorite_genre && (
            <span style={{ background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.3)', color: 'var(--color-cyan)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Music size={12} /> {profile.favorite_genre}
            </span>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{totalAlbums}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Álbuns</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-amber)' }}>{avgRating}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Média ★</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ff4d6d' }}>{favoriteAlbums.length}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Favoritos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-cyan)' }}>~{totalHours}h</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Ouvidas</div>
          </div>
        </div>
      </div>

      {/* Letterboxd-Style Top 4 Favorite Albums Row */}
      {topFour.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} color="#ff4d6d" /> Álbuns Favoritos de Todos os Tempos (Top 4)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {topFour.map((alb) => (
              <div
                key={alb.id}
                onClick={() => onSelectAlbum(alb)}
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 77, 109, 0.4)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 77, 109, 0.2)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <img src={alb.cover_url} alt={alb.album_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, inset: 'auto 0 0 0', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '4px', fontSize: '9px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {alb.album_title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Navigation Bar inside Profile */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <button
          onClick={() => setSubTab('stats')}
          style={{
            flex: 1,
            padding: '10px',
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'stats' ? '2px solid var(--color-green)' : 'none',
            color: subTab === 'stats' ? 'var(--color-green)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <BarChart2 size={16} /> Estatísticas
        </button>
        <button
          onClick={() => setSubTab('reviews')}
          style={{
            flex: 1,
            padding: '10px',
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'reviews' ? '2px solid var(--color-green)' : 'none',
            color: subTab === 'reviews' ? 'var(--color-green)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <BookOpen size={16} /> Resenhas ({reviews.length})
        </button>
        <button
          onClick={() => setSubTab('favorites')}
          style={{
            flex: 1,
            padding: '10px',
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'favorites' ? '2px solid var(--color-green)' : 'none',
            color: subTab === 'favorites' ? 'var(--color-green)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Heart size={16} /> Favoritos ({favoriteAlbums.length})
        </button>
      </div>

      {/* SUB TAB 1: ESTATÍSTICAS */}
      {subTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Rating Distribution Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} color="var(--color-amber)" fill="var(--color-amber)" /> Distribuição de Avaliações
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star];
                const pct = Math.round((count / maxRatingCount) * 100);
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-amber)', width: '32px' }}>
                      {star} ★
                    </span>
                    <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, var(--color-amber) 0%, #ff8c00 100%)',
                        borderRadius: '7px',
                        transition: 'width 0.4s ease'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '20px', textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Genres Breakdown */}
          {topGenres.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Music size={16} color="var(--color-cyan)" /> Gêneros Mais Ouvidos
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topGenres.map(([genre, count], idx) => {
                  const pct = Math.round((count / totalAlbums) * 100);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{genre}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} álbuns ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-cyan)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Artists Breakdown */}
          {topArtists.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Disc size={16} color="var(--color-green)" /> Artistas Mais Avaliados
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topArtists.map(([artist, count], idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{artist}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-green)' }}>{count} resenha{count > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: MINHAS RESENHAS */}
      {subTab === 'reviews' && (
        <div>
          {/* Search & Filter row */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Filtrar por nome ou artista..."
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: '#14181c',
                border: '1px solid var(--border-color)',
                color: '#fff',
                borderRadius: '10px',
                padding: '8px 10px',
                fontSize: '12px',
                fontFamily: 'inherit'
              }}
            >
              <option value="recent">Mais Recentes</option>
              <option value="rating_desc">Nota Mais Alta</option>
              <option value="rating_asc">Nota Mais Baixa</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                onClick={() => onSelectAlbum(rev)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <img src={rev.cover_url} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{rev.album_title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--color-green)', fontWeight: 600 }}>{rev.artist_name}</p>
                    </div>
                    <StarRating rating={rev.rating} readonly size={12} />
                  </div>
                  {rev.review_text && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{rev.review_text}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: ÁLBUNS FAVORITOS */}
      {subTab === 'favorites' && (
        <div>
          {favoriteAlbums.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Nenhum álbum marcado como favorito ainda.
            </div>
          ) : (
            <div className="album-grid">
              {favoriteAlbums.map((alb) => (
                <AlbumCard
                  key={alb.id}
                  album={alb}
                  review={alb}
                  onClick={(a) => onSelectAlbum(a)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
