import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AlbumCard } from './components/AlbumCard';
import { AlbumDetailModal } from './components/AlbumDetailModal';
import { ReviewModal } from './components/ReviewModal';
import { MiniPlayer } from './components/MiniPlayer';
import { SettingsModal } from './components/SettingsModal';
import { ProfileView } from './components/ProfileView';
import { EditProfileModal } from './components/EditProfileModal';
import { CreateListModal } from './components/CreateListModal';
import { AuthScreen } from './components/AuthScreen';
import { StarRating } from './components/StarRating';
import { searchAlbums, searchTracks, searchAll, getTrendingAlbums } from './services/musicApi';
import { fetchReviews, createOrUpdateReview, deleteReview, getLocalLists, saveLocalList, fetchProfile, updateProfile, fetchTrackRatings, saveTrackRating, getLocalTrackRatings, supabase } from './services/supabase';
import { Search, Plus, BookOpen, Flame, Disc, Trash2, Edit3, LogOut, Layers, Heart, Play, Pause, Music } from 'lucide-react';

export default function App() {
  // Session State
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem('soundboxd_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('home');
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [lists, setLists] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('tracks'); // 'tracks' | 'albums' | 'all'
  const [searchResults, setSearchResults] = useState({ albums: [], tracks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [userTrackRatings, setUserTrackRatings] = useState({});

  // Modals state
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [reviewAlbum, setReviewAlbum] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);

  // MiniPlayer state
  const [currentTrack, setCurrentTrack] = useState(null);

  // Load Initial Data when logged in
  useEffect(() => {
    if (userSession) {
      loadData();
    }
  }, [userSession]);

  const loadData = async () => {
    setLoading(true);
    const [trending, revs, prof] = await Promise.all([
      getTrendingAlbums(),
      fetchReviews(),
      fetchProfile()
    ]);
    setTrendingAlbums(trending);
    setReviews(revs);
    setProfile(prof || {
      full_name: userSession.full_name,
      username: userSession.username,
      avatar_url: userSession.avatar_url,
      bio: ''
    });
    setLists(getLocalLists());
    setUserTrackRatings(getLocalTrackRatings());
    setLoading(false);
  };

  // Logout Handler
  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      localStorage.removeItem('soundboxd_session');
      if (supabase) {
        supabase.auth.signOut();
      }
      setUserSession(null);
    }
  };

  // If user is not logged in, display Auth Screen first!
  if (!userSession) {
    return <AuthScreen onLoginSuccess={(session) => setUserSession(session)} />;
  }

  // Search Handler (Supports both Tracks and Albums)
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults({ albums: [], tracks: [] });
      return;
    }
    setIsSearching(true);
    const res = await searchAll(term);
    setSearchResults(res);
    setIsSearching(false);
  };

  // Track Rating from Search Results
  const handleRateTrackFromSearch = async (track, rating) => {
    const key = `${track.album_id}_${track.track_id}`;
    const current = userTrackRatings[key] || {};
    const updated = {
      album_id: String(track.album_id),
      track_id: String(track.track_id),
      track_name: track.track_name,
      artist_name: track.artist_name,
      rating,
      is_favorite: Boolean(current.is_favorite)
    };

    setUserTrackRatings(prev => ({ ...prev, [key]: updated }));
    await saveTrackRating(updated);
  };

  const handleToggleFavoriteTrackFromSearch = async (track) => {
    const key = `${track.album_id}_${track.track_id}`;
    const current = userTrackRatings[key] || {};
    const updated = {
      album_id: String(track.album_id),
      track_id: String(track.track_id),
      track_name: track.track_name,
      artist_name: track.artist_name,
      rating: current.rating || 5.0,
      is_favorite: !current.is_favorite
    };

    setUserTrackRatings(prev => ({ ...prev, [key]: updated }));
    await saveTrackRating(updated);
  };

  // Review Handlers
  const handleSaveReview = async (reviewData) => {
    await createOrUpdateReview(reviewData);
    setReviewAlbum(null);
    setEditingReview(null);
    loadData(); // reload reviews
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Deseja excluir esta avaliação do seu diário?')) {
      await deleteReview(id);
      loadData();
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (updatedProfile) => {
    await updateProfile(updatedProfile);
    setProfile(updatedProfile);
    setShowEditProfile(false);
  };

  // List Save Handler
  const handleSaveList = (newList) => {
    const updatedLists = saveLocalList(newList);
    setLists(updatedLists);
    setShowCreateList(false);
  };

  // Quick helper to check if an album has been reviewed
  const getReviewForAlbum = (albumId) => {
    return reviews.find(r => String(r.album_id) === String(albumId));
  };

  return (
    <>
      {/* Mobile Top Header with Logout Option */}
      <Header onOpenSettings={() => setShowSettings(true)} />

      {/* Logout Bar Banner */}
      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Conectado como <strong style={{ color: '#fff' }}>@{profile?.username || userSession.username}</strong>
        </span>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: '#ff4d6d', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <LogOut size={12} /> Sair
        </button>
      </div>

      {/* Main Screen Content */}
      <main className="app-content">

        {/* TAB 1: INÍCIO / HOME */}
        {activeTab === 'home' && (
          <div>
            {/* Quick Hero Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,224,84,0.15) 0%, rgba(0,242,254,0.05) 100%)',
              border: '1px solid rgba(0,224,84,0.2)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BEM-VINDO!
                </span>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '4px 0 2px 0' }}>
                  O que você ouviu hoje?
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Avalie músicas e álbuns, escreva resenhas e ouça prévias.
                </p>
              </div>
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 14px', fontSize: '12px' }}
                onClick={() => setActiveTab('search')}
              >
                <Plus size={16} /> Avaliar
              </button>
            </div>

            {/* Section: Trending / Popular Albums */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} color="var(--color-green)" /> Álbuns em Destaque
                </h3>
                <button
                  onClick={() => setActiveTab('search')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-green)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Ver mais
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Carregando catálogo...
                </div>
              ) : (
                <div className="album-grid">
                  {trendingAlbums.slice(0, 6).map((album) => (
                    <AlbumCard
                      key={album.album_id}
                      album={album}
                      review={getReviewForAlbum(album.album_id)}
                      onClick={(alb) => setSelectedAlbum(alb)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section: Recent Reviews Feed */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} color="var(--color-cyan)" /> Atividade Recente
              </h3>

              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <Disc size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nenhuma avaliação registrada ainda.</p>
                  <button
                    className="btn-primary"
                    style={{ margin: '12px auto 0 auto', width: 'auto', padding: '8px 16px', fontSize: '12px' }}
                    onClick={() => setActiveTab('search')}
                  >
                    Buscar Primeira Música ou Álbum
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.slice(0, 5).map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        gap: '12px'
                      }}
                    >
                      <img
                        src={rev.cover_url}
                        alt=""
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                        onClick={() => setSelectedAlbum(rev)}
                      />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4
                              style={{ fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                              onClick={() => setSelectedAlbum(rev)}
                            >
                              {rev.album_title}
                            </h4>
                            <p style={{ fontSize: '11px', color: 'var(--color-green)', fontWeight: 600 }}>{rev.artist_name}</p>
                          </div>
                          <StarRating rating={rev.rating} readonly size={12} />
                        </div>
                        {rev.review_text && (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            "{rev.review_text}"
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          <span>{new Date(rev.listened_date || rev.created_at).toLocaleDateString('pt-BR')}</span>
                          {rev.is_relisten && <span style={{ color: 'var(--color-cyan)' }}>• Re-ouviu</span>}
                          {rev.is_favorite && <span style={{ color: '#ff4d6d' }}>• Favorito</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BUSCAR / SEARCH (Supports Músicas & Álbuns) */}
        {activeTab === 'search' && (
          <div>
            {/* Search Bar Input */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Buscar por música, artista ou álbum..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
                autoFocus
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Filter Pills: Músicas vs Álbuns vs Todas */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setSearchFilter('tracks')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '20px',
                  border: searchFilter === 'tracks' ? '1px solid var(--color-green)' : '1px solid var(--border-color)',
                  background: searchFilter === 'tracks' ? 'rgba(0, 224, 84, 0.15)' : 'var(--bg-card)',
                  color: searchFilter === 'tracks' ? 'var(--color-green)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Music size={14} /> Músicas ({searchResults.tracks.length})
              </button>

              <button
                type="button"
                onClick={() => setSearchFilter('albums')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '20px',
                  border: searchFilter === 'albums' ? '1px solid var(--color-green)' : '1px solid var(--border-color)',
                  background: searchFilter === 'albums' ? 'rgba(0, 224, 84, 0.15)' : 'var(--bg-card)',
                  color: searchFilter === 'albums' ? 'var(--color-green)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Disc size={14} /> Álbuns ({searchResults.albums.length})
              </button>

              <button
                type="button"
                onClick={() => setSearchFilter('all')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: searchFilter === 'all' ? '1px solid var(--color-green)' : '1px solid var(--border-color)',
                  background: searchFilter === 'all' ? 'rgba(0, 224, 84, 0.15)' : 'var(--bg-card)',
                  color: searchFilter === 'all' ? 'var(--color-green)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Todas
              </button>
            </div>

            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Buscando músicas e álbuns na iTunes Music API...
              </div>
            ) : (searchResults.tracks.length > 0 || searchResults.albums.length > 0) ? (
              <div>

                {/* TRACKS / MÚSICAS RESULTS SECTION */}
                {(searchFilter === 'tracks' || searchFilter === 'all') && searchResults.tracks.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 800 }}>
                      MÚSICAS ENCONTRADAS ({searchResults.tracks.length})
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {searchResults.tracks.map((track) => {
                        const isPlaying = currentTrack?.track_id === track.track_id;
                        const key = `${track.album_id}_${track.track_id}`;
                        const currentData = userTrackRatings[key] || {};
                        const rating = currentData.rating || 0;
                        const isFav = currentData.is_favorite || false;

                        return (
                          <div
                            key={track.track_id}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '12px',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={track.cover_url}
                                alt=""
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                                onClick={() => setSelectedAlbum(track)}
                              />
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {track.track_name}
                                </h4>
                                <p style={{ fontSize: '11px', color: 'var(--color-green)', fontWeight: 600 }}>
                                  {track.artist_name} • <span style={{ color: 'var(--text-secondary)' }}>{track.album_title}</span>
                                </p>
                              </div>

                              {track.preview_url && (
                                <button
                                  onClick={() => setCurrentTrack({ ...track, cover_url: track.cover_url })}
                                  style={{
                                    background: isPlaying ? 'var(--color-green)' : 'rgba(255,255,255,0.1)',
                                    color: isPlaying ? '#000' : '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                >
                                  {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                                </button>
                              )}
                            </div>

                            {/* Direct Song Rating & Actions bar */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>Avaliar:</span>
                                <StarRating
                                  rating={rating}
                                  onRatingChange={(val) => handleRateTrackFromSearch(track, val)}
                                  size={14}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                  onClick={() => handleToggleFavoriteTrackFromSearch(track)}
                                  style={{ background: 'none', border: 'none', color: isFav ? '#ff4d6d' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                                >
                                  <Heart size={14} fill={isFav ? '#ff4d6d' : 'none'} />
                                  <span>{isFav ? 'Destaque' : 'Favoritar'}</span>
                                </button>

                                <button
                                  onClick={() => setSelectedAlbum(track)}
                                  style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Ver Álbum
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ALBUMS RESULTS SECTION */}
                {(searchFilter === 'albums' || searchFilter === 'all') && searchResults.albums.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 800 }}>
                      ÁLBUNS ENCONTRADOS ({searchResults.albums.length})
                    </p>
                    <div className="album-grid">
                      {searchResults.albums.map((album) => (
                        <AlbumCard
                          key={album.album_id}
                          album={album}
                          review={getReviewForAlbum(album.album_id)}
                          onClick={(alb) => setSelectedAlbum(alb)}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : searchTerm ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Nenhuma música ou álbum encontrado para "{searchTerm}".
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 700 }}>
                  RECOMENDAÇÕES POPULARES
                </p>
                <div className="album-grid">
                  {trendingAlbums.map((album) => (
                    <AlbumCard
                      key={album.album_id}
                      album={album}
                      review={getReviewForAlbum(album.album_id)}
                      onClick={(alb) => setSelectedAlbum(alb)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIÁRIO / DIARY */}
        {activeTab === 'diary' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Seu Diário de Música</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{reviews.length} álbuns avaliados e registrados</p>
              </div>
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
                onClick={() => setActiveTab('search')}
              >
                <Plus size={14} /> Novo
              </button>
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '12px' }}>
                <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Seu diário está vazio.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={rev.cover_url}
                      alt=""
                      style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => setSelectedAlbum(rev)}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', cursor: 'pointer' }} onClick={() => setSelectedAlbum(rev)}>
                            {rev.album_title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--color-green)', fontWeight: 600 }}>{rev.artist_name}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => { setEditingReview(rev); setReviewAlbum(rev); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            style={{ background: 'none', border: 'none', color: '#ff4d6d', cursor: 'pointer', padding: '2px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div style={{ marginTop: '4px', marginBottom: '6px' }}>
                        <StarRating rating={rev.rating} readonly size={14} />
                      </div>

                      {rev.review_text && (
                        <p style={{ fontSize: '12px', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px', borderLeft: '2px solid var(--color-green)' }}>
                          {rev.review_text}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        <span>Escutado em: {new Date(rev.listened_date || rev.created_at).toLocaleDateString('pt-BR')}</span>
                        {rev.is_relisten && <span style={{ color: 'var(--color-cyan)' }}>• Re-ouviu</span>}
                        {rev.is_favorite && <span style={{ color: '#ff4d6d', fontWeight: 700 }}>♥ Favorito</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LISTAS / LISTAS & COLEÇÕES PERSONALIZADAS */}
        {activeTab === 'lists' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Coleções & Listas</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Crie e gerencie suas coleções temáticas de álbuns</p>
              </div>
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '8px 14px', fontSize: '12px' }}
                onClick={() => setShowCreateList(true)}
              >
                <Plus size={16} /> Criar Lista
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {lists.map((list) => (
                <div
                  key={list.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{list.title}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-green)', fontWeight: 700 }}>{list.items ? list.items.length : 0} álbuns</span>
                  </div>
                  {list.description && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{list.description}</p>
                  )}
                  
                  {/* List item covers */}
                  {list.items && list.items.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {list.items.map((item, idx) => (
                        <div key={idx} style={{ flexShrink: 0, textAlign: 'center', width: '60px' }}>
                          <img
                            src={item.cover_url}
                            alt=""
                            style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ fontSize: '9px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {item.album_title}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lista vazia.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PERFIL & ESTATÍSTICAS COMPLETO */}
        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            reviews={reviews}
            onSelectAlbum={(alb) => setSelectedAlbum(alb)}
            onOpenEditProfile={() => setShowEditProfile(true)}
          />
        )}

      </main>

      {/* Floating Audio MiniPlayer */}
      <MiniPlayer track={currentTrack} onClose={() => setCurrentTrack(null)} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Album Detail Modal */}
      {selectedAlbum && (
        <AlbumDetailModal
          album={selectedAlbum}
          userReview={getReviewForAlbum(selectedAlbum.album_id)}
          onClose={() => setSelectedAlbum(null)}
          onOpenReview={(alb) => {
            setReviewAlbum(alb);
            setEditingReview(getReviewForAlbum(alb.album_id));
            setSelectedAlbum(null);
          }}
          onPlayTrack={(track) => setCurrentTrack(track)}
          currentPlayingTrack={currentTrack}
        />
      )}

      {/* Review Modal (Bottom Sheet) */}
      {reviewAlbum && (
        <ReviewModal
          album={reviewAlbum}
          existingReview={editingReview}
          onClose={() => { setReviewAlbum(null); setEditingReview(null); }}
          onSaveReview={handleSaveReview}
        />
      )}

      {/* Settings Modal (Supabase & Database Config) */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSaveConfig={loadData}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Create List Modal */}
      {showCreateList && (
        <CreateListModal
          onClose={() => setShowCreateList(false)}
          onSaveList={handleSaveList}
        />
      )}
    </>
  );
}
