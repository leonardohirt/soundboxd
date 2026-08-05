import React, { useState } from 'react';
import { X, Plus, Search, Trash2, Save, Layers, Disc } from 'lucide-react';
import { searchAlbums } from '../services/musicApi';
import { generateUUID } from '../services/supabase';

export function CreateListModal({ onClose, onSaveList }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listItems, setListItems] = useState([]);

  // Album Search inside List modal
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchAlbums = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const res = await searchAlbums(term);
    setSearchResults(res);
    setIsSearching(false);
  };

  const handleAddAlbum = (album) => {
    if (!listItems.some(i => String(i.album_id) === String(album.album_id))) {
      setListItems(prev => [...prev, album]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveAlbum = (albumId) => {
    setListItems(prev => prev.filter(i => String(i.album_id) !== String(albumId)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newList = {
      id: generateUUID(),
      title,
      description,
      created_at: new Date().toISOString(),
      items: listItems.map(item => ({
        album_id: item.album_id,
        album_title: item.album_title,
        artist_name: item.artist_name,
        cover_url: item.cover_url
      }))
    };

    onSaveList(newList);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" style={{ maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--color-green)" /> Criar Nova Lista de Álbuns
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
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              TÍTULO DA LISTA
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="ex: Álbuns para Ouvir de Madrugada"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              DESCRIÇÃO / CONCEITO DA LISTA
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Descreva o tema da sua coleção de álbuns..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Add Albums to List Section */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              ADICIONAR ÁLBUNS À LISTA ({listItems.length})
            </label>

            {/* Selected Albums Row */}
            {listItems.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                {listItems.map((item) => (
                  <div key={item.album_id} style={{ position: 'relative', width: '64px', flexShrink: 0 }}>
                    <img src={item.cover_url} alt="" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveAlbum(item.album_id)}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ff4d6d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                    </button>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {item.album_title}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Album Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Buscar álbum para adicionar à lista..."
                value={searchTerm}
                onChange={(e) => handleSearchAlbums(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Search Results dropdown */}
            {searchResults.length > 0 && (
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                background: '#191d21',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                marginTop: '6px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {searchResults.map((album) => (
                  <div
                    key={album.album_id}
                    onClick={() => handleAddAlbum(album)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer'
                    }}
                  >
                    <img src={album.cover_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {album.album_title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-green)' }}>{album.artist_name}</div>
                    </div>
                    <Plus size={16} color="var(--color-green)" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            <Save size={18} /> Salvar Nova Lista
          </button>
        </form>
      </div>
    </div>
  );
}
