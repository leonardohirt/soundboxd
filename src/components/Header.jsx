import React from 'react';
import { Disc, Settings, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export function Header({ onOpenSettings }) {
  const connected = isSupabaseConfigured();

  return (
    <header className="app-header">
      <div className="brand-logo">
        <Disc size={24} style={{ color: 'var(--color-purple-light)' }} />
        <span>Soundboxd</span>
        <div className="logo-dots">
          <span className="dot dot-green"></span>
          <span className="dot dot-cyan"></span>
          <span className="dot dot-purple"></span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onOpenSettings}
          title={connected ? "Supabase Conectado" : "Configurações do Banco"}
          style={{
            background: 'rgba(248, 250, 252, 0.05)',
            border: '1px solid var(--border-color)',
            color: connected ? 'var(--color-purple-light)' : 'var(--text-secondary)',
            borderRadius: '8px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Database size={14} color={connected ? 'var(--color-purple-light)' : 'var(--text-muted)'} />
          <span>{connected ? 'Supabase' : 'Offline/Local'}</span>
          <Settings size={14} style={{ marginLeft: '2px', opacity: 0.7 }} />
        </button>
      </div>
    </header>
  );
}
