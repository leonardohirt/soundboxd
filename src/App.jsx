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
import { StarRating } from './components/StarRating';
import { searchAlbums, getTrendingAlbums } from './services/musicApi';
import { fetchReviews, createOrUpdateReview, deleteReview, getLocalLists, fetchProfile, updateProfile } from './services/supabase';
import { Search, Plus, BookOpen, Flame, Disc, Trash2, Edit3, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [lists, setLists] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modals state
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [reviewAlbum, setReviewAlbum] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // MiniPlayer state
  const [currentTrack, setCurrentTrack] = useState(null);

  // Load Initial Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [trending, revs, prof] = await Promise.all([
      getTrendingAlbums(),
      fetchReviews(),
      fetchProfile()
    ]);
    setTrendingAlbums(trending);
    setReviews(revs);
    setProfile(prof);
    setLists(getLocalLists());
    setLoading(false);
  };

  // Search Handler
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchAlbums(term);
    setSearchResults(results);
    setIsSearching(false);
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

  // Quick helper to check if an album has been reviewed
  const getReviewForAlbum = (albumId) => {
    return reviews.find(r => String(r.album_id) === String(albumId));
  };

  return (
    <>
      {/* Mobile Top Header */}
      <Header onOpenSettings={() => setShowSettings(true)} />

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
                  DIÁRIO DE MÚSICA
                </span>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '4px 0 2px 0' }}>
                  O que você ouviu hoje?
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Avalie álbuns, escreva resenhas e ouça prévias.
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
                    Buscar Primeiro Álbum
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

        {/* TAB 2: BUSCAR / SEARCH */}
        {activeTab === 'search' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Buscar por álbum, artista ou banda..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
                autoFocus
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Buscando na iTunes Music API...
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                  RESULTADOS PARA "{searchTerm}" ({searchResults.length})
                </p>
                <div className="album-grid">
                  {searchResults.map((album) => (
                    <AlbumCard
                      key={album.album_id}
                      album={album}
                      review={getReviewForAlbum(album.album_id)}
                      onClick={(alb) => setSelectedAlbum(alb)}
                    />
                  ))}
                </div>
              </div>
            ) : searchTerm ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Nenhum álbum encontrado para "{searchTerm}".
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
                        {rev.is_favorite && <span style={{ color: '#ff4d6d', fontWeight: 700 }}>♥ Favorito</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LISTAS / LISTS */}
        {activeTab === 'lists' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Coleções & Listas</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Crie listas temáticas de álbuns</p>
              </div>
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
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{list.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{list.description}</p>
                  
                  {/* List item covers */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {list.items.map((item, idx) => (
                      <img
                        key={idx}
                        src={item.cover_url}
                        alt=""
                        style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
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
    </>
  );
}
