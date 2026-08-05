import React, { useState } from 'react';
import { X, User, Save, Camera, Music, Sparkles } from 'lucide-react';

export function EditProfileModal({ profile, onClose, onSave }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [favoriteArtist, setFavoriteArtist] = useState(profile?.favorite_artist || '');
  const [favoriteGenre, setFavoriteGenre] = useState(profile?.favorite_genre || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      full_name: fullName,
      username: username.replace('@', ''),
      avatar_url: avatarUrl,
      bio,
      favorite_artist: favoriteArtist,
      favorite_genre: favoriteGenre,
      updated_at: new Date().toISOString()
    };
    onSave(updated);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--color-green)" /> Editar Perfil
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Avatar Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-green), var(--color-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#000' }}>
                {fullName ? fullName.substring(0, 2).toUpperCase() : 'SB'}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                URL DA FOTO DE PERFIL
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="https://exemplo.com/sua-foto.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              NOME COMPLETO
            </label>
            <input
              type="text"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu Nome"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              NOME DE USUÁRIO (@USERNAME)
            </label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seunome"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              BIO / SOBRE VOCÊ
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre seu gosto musical..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                ARTISTA FAVORITO
              </label>
              <input
                type="text"
                className="input-field"
                value={favoriteArtist}
                onChange={(e) => setFavoriteArtist(e.target.value)}
                placeholder="Ex: Daft Punk"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                GÊNERO FAVORITO
              </label>
              <input
                type="text"
                className="input-field"
                value={favoriteGenre}
                onChange={(e) => setFavoriteGenre(e.target.value)}
                placeholder="Ex: MPB / Rock"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            <Save size={18} /> Salvar Perfil
          </button>
        </form>
      </div>
    </div>
  );
}
