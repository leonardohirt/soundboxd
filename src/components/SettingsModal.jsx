import React, { useState } from 'react';
import { X, Database, Save, Check, Copy, Code } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export function SettingsModal({ onClose, onSaveConfig }) {
  const [url, setUrl] = useState(localStorage.getItem('soundboxd_sb_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [key, setKey] = useState(localStorage.getItem('soundboxd_sb_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [copied, setCopied] = useState(false);
  const isConfigured = isSupabaseConfigured();

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('soundboxd_sb_url', url.trim());
    localStorage.setItem('soundboxd_sb_key', key.trim());
    onSaveConfig();
    onClose();
  };

  const copySchemaSql = () => {
    const sql = `-- SOUNDBOXD SUPABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id TEXT NOT NULL,
  album_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  release_year TEXT,
  genre TEXT,
  rating NUMERIC(2,1),
  review_text TEXT,
  listened_date DATE DEFAULT CURRENT_DATE,
  is_relisten BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--color-green)" /> Configuração do Banco (Supabase)
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

        <div style={{ background: isConfigured ? 'rgba(0, 224, 84, 0.1)' : 'rgba(255, 183, 3, 0.1)', border: isConfigured ? '1px solid var(--color-green)' : '1px solid var(--color-amber)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
          <div style={{ fontWeight: 700, color: isConfigured ? 'var(--color-green)' : 'var(--color-amber)', marginBottom: '4px' }}>
            {isConfigured ? '✓ Supabase Ativo e Conectado' : '⚠️ Modo Local (LocalStorage Ativo)'}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isConfigured
              ? 'Seus dados de resenhas e diário estão sincronizando em nuvem no Supabase.'
              : 'Insira sua URL e Anon Key do projeto Supabase para conectar seu banco de dados. Enquanto isso, o diário funciona perfeitamente em modo de demonstração local!'}
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              SUPABASE PROJECT URL
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="https://xyz.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              SUPABASE ANON KEY / PUBLISHABLE KEY
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="sb_publishable_..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              <Save size={16} /> Save Credentials
            </button>
            <button
              type="button"
              onClick={copySchemaSql}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={16} color="var(--color-green)" /> : <Code size={16} />}
              <span>{copied ? 'SQL Copiado!' : 'Copiar SQL Schema'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
