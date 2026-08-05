import React, { useState } from 'react';
import { Disc, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured, saveLocalProfile, updateProfile } from '../services/supabase';

export function AuthScreen({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanUsername = username.trim() ? username.replace('@', '') : (email.split('@')[0] || 'usuario');
    const displayName = fullName.trim() || cleanUsername;

    if (isSupabaseConfigured() && supabase) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: displayName,
                username: cleanUsername
              }
            }
          });

          if (error) throw error;
          const user = data.user;
          const userSession = {
            id: user ? user.id : 'usr-' + Date.now(),
            email,
            full_name: displayName,
            username: cleanUsername,
            avatar_url: ''
          };

          localStorage.setItem('soundboxd_session', JSON.stringify(userSession));
          saveLocalProfile(userSession);
          await updateProfile(userSession);
          onLoginSuccess(userSession);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;
          const user = data.user;
          const userSession = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || displayName,
            username: user.user_metadata?.username || cleanUsername,
            avatar_url: user.user_metadata?.avatar_url || ''
          };

          localStorage.setItem('soundboxd_session', JSON.stringify(userSession));
          saveLocalProfile(userSession);
          await updateProfile(userSession);
          onLoginSuccess(userSession);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setErrorMsg(err.message || 'Erro de autenticação. Verifique os dados.');
        setLoading(false);
        return;
      }
    } else {
      // Local Auth Fallback
      setTimeout(async () => {
        const userSession = {
          id: 'usr-' + Date.now(),
          email,
          full_name: displayName,
          username: cleanUsername,
          avatar_url: ''
        };
        localStorage.setItem('soundboxd_session', JSON.stringify(userSession));
        saveLocalProfile(userSession);
        onLoginSuccess(userSession);
        setLoading(false);
      }, 400);
    }
  };

  const handleGuestLogin = () => {
    const guestSession = {
      id: 'guest-user',
      email: 'visitante@soundboxd.app',
      full_name: 'Ouvinte Visitante',
      username: 'visitante',
      avatar_url: ''
    };
    localStorage.setItem('soundboxd_session', JSON.stringify(guestSession));
    saveLocalProfile(guestSession);
    onLoginSuccess(guestSession);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 20px',
      background: 'radial-gradient(circle at top, rgba(124, 58, 237, 0.18) 0%, #0F172A 70%)'
    }}>
      {/* Brand Hero Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-purple-main) 0%, var(--color-purple-light) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 0 30px var(--color-purple-glow)'
        }}>
          <Disc size={38} color="#fff" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.5px' }}>
          Soundboxd
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Seu diário e rede social de avaliação de música
        </p>
      </div>

      {/* Auth Form Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Toggle Login vs Sign Up */}
        <div style={{ display: 'flex', background: 'rgba(15,23,42,0.6)', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: !isSignUp ? 'var(--color-purple-main)' : 'none',
              color: !isSignUp ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: isSignUp ? 'var(--color-purple-main)' : 'none',
              color: isSignUp ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Criar Conta
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(255, 77, 109, 0.15)',
            border: '1px solid #ff4d6d',
            color: '#ff4d6d',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  NOME COMPLETO
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Seu Nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  NOME DE USUÁRIO (@HANDLE)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="ex: seunome"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <Sparkles size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              E-MAIL
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-field"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              SENHA
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            <span>{loading ? 'Autenticando...' : isSignUp ? 'Criar Conta' : 'Entrar no App'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Guest access option */}
        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={handleGuestLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Entrar como Visitante / Testar sem conta
          </button>
        </div>
      </div>
    </div>
  );
}
