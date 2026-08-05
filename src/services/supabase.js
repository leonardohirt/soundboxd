import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('soundboxd_sb_url') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('soundboxd_sb_key') || '';

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 10
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Standard clean profile fallback (No hardcoded bio or favorite artist)
const INITIAL_DEMO_PROFILE = {
  id: generateUUID(),
  username: 'ouvinte',
  full_name: 'Usuário Soundboxd',
  avatar_url: '',
  bio: '',
  favorite_artist: '',
  favorite_genre: ''
};

const INITIAL_DEMO_REVIEWS = [
  {
    id: generateUUID(),
    album_id: '1440857781',
    album_title: 'Random Access Memories',
    artist_name: 'Daft Punk',
    cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a3/be/02/a3be020c-78db-b035-7140-52efebf00d23/886443927087.jpg/600x600bb.jpg',
    release_year: '2013',
    genre: 'Dance/Eletrônica',
    rating: 5.0,
    review_text: 'Uma obra-prima atemporal do groove e sintetizadores analógicos. Giorgio by Moroder é insano!',
    listened_date: '2026-08-04',
    is_relisten: true,
    is_favorite: true,
    created_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    album_id: '1540328103',
    album_title: 'Clube da Esquina',
    artist_name: 'Milton Nascimento & Lô Borges',
    cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/80/c9/ed/80c9ed3d-a517-91fb-fb28-6bcfa12df93a/724349372124.jpg/600x600bb.jpg',
    release_year: '1972',
    genre: 'MPB / Rock Psicodélico',
    rating: 5.0,
    review_text: 'Um dos maiores discos da história da música mundial. O arranjo de harmonias e vocais é emocionante.',
    listened_date: '2026-08-03',
    is_relisten: false,
    is_favorite: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: generateUUID(),
    album_id: '1440872996',
    album_title: 'Abbey Road',
    artist_name: 'The Beatles',
    cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/91/9f/f0/919ff089-a297-c035-ef7c-faed4c2f1f0a/00602508017361.rgb.jpg/600x600bb.jpg',
    release_year: '1969',
    genre: 'Rock',
    rating: 4.5,
    review_text: 'O medley no lado B é o ápice técnico e criativo dos Beatles.',
    listened_date: '2026-08-01',
    is_relisten: true,
    is_favorite: false,
    created_at: new Date(Date.now() - 259200000).toISOString()
  }
];

const INITIAL_DEMO_LISTS = [
  {
    id: generateUUID(),
    title: 'Álbuns Essenciais para Ouvir de Madrugada',
    description: 'Vibes noturnas, sintetizadores e MPB suave para se desligar do mundo.',
    created_at: new Date().toISOString(),
    items: [
      { album_id: '1440857781', album_title: 'Random Access Memories', artist_name: 'Daft Punk', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a3/be/02/a3be020c-78db-b035-7140-52efebf00d23/886443927087.jpg/600x600bb.jpg' },
      { album_id: '1540328103', album_title: 'Clube da Esquina', artist_name: 'Milton Nascimento & Lô Borges', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/80/c9/ed/80c9ed3d-a517-91fb-fb28-6bcfa12df93a/724349372124.jpg/600x600bb.jpg' }
    ]
  }
];

// Profile storage helpers bound to active user session
export const getLocalProfile = () => {
  const sessionData = localStorage.getItem('soundboxd_session');
  const session = sessionData ? JSON.parse(sessionData) : null;
  const data = localStorage.getItem('soundboxd_profile');
  
  if (data) {
    const parsed = JSON.parse(data);
    if (session && session.username && session.username !== 'visitante') {
      return {
        ...parsed,
        full_name: session.full_name || parsed.full_name,
        username: session.username || parsed.username
      };
    }
    return parsed;
  }
  
  if (session && session.username) {
    const userProfile = {
      id: session.id || generateUUID(),
      username: session.username,
      full_name: session.full_name || 'Usuário Soundboxd',
      avatar_url: session.avatar_url || '',
      bio: session.bio || '',
      favorite_artist: session.favorite_artist || '',
      favorite_genre: session.favorite_genre || ''
    };
    localStorage.setItem('soundboxd_profile', JSON.stringify(userProfile));
    return userProfile;
  }

  localStorage.setItem('soundboxd_profile', JSON.stringify(INITIAL_DEMO_PROFILE));
  return INITIAL_DEMO_PROFILE;
};

export const saveLocalProfile = (profileData) => {
  const current = getLocalProfile();
  const updated = { ...current, ...profileData };
  localStorage.setItem('soundboxd_profile', JSON.stringify(updated));
  return updated;
};

export const fetchProfile = async (sessionUser) => {
  const session = sessionUser || (localStorage.getItem('soundboxd_session') ? JSON.parse(localStorage.getItem('soundboxd_session')) : null);
  
  if (isSupabaseConfigured() && supabase && session && session.username) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.eq.${session.username},id.eq.${session.id}`)
        .limit(1);
      if (!error && data && data.length > 0) {
        const prof = { ...data[0], full_name: session.full_name || data[0].full_name, username: session.username || data[0].username };
        saveLocalProfile(prof);
        return prof;
      }
    } catch (err) {
      console.warn('Supabase profile fetch error', err);
    }
  }
  return getLocalProfile();
};

export const updateProfile = async (profileData) => {
  saveLocalProfile(profileData);
  if (isSupabaseConfigured() && supabase) {
    try {
      const payload = { ...profileData };
      if (!payload.id || !payload.id.includes('-')) {
        delete payload.id;
      }
      await supabase.from('profiles').upsert(payload);
    } catch (err) {
      console.warn('Supabase profile update error', err);
    }
  }
  return profileData;
};

// Reviews storage helpers
export const getLocalReviews = () => {
  const data = localStorage.getItem('soundboxd_reviews');
  if (!data) {
    localStorage.setItem('soundboxd_reviews', JSON.stringify(INITIAL_DEMO_REVIEWS));
    return INITIAL_DEMO_REVIEWS;
  }
  return JSON.parse(data);
};

export const saveLocalReview = (newReview) => {
  const reviews = getLocalReviews();
  const index = reviews.findIndex(r => r.id === newReview.id || r.album_id === newReview.album_id);
  let updated;
  if (index >= 0) {
    updated = [...reviews];
    updated[index] = { ...updated[index], ...newReview };
  } else {
    updated = [newReview, ...reviews];
  }
  localStorage.setItem('soundboxd_reviews', JSON.stringify(updated));
  return updated;
};

export const deleteLocalReview = (id) => {
  const reviews = getLocalReviews();
  const updated = reviews.filter(r => r.id !== id);
  localStorage.setItem('soundboxd_reviews', JSON.stringify(updated));
  return updated;
};

// Track Ratings storage helpers
export const getLocalTrackRatings = () => {
  const data = localStorage.getItem('soundboxd_track_ratings');
  return data ? JSON.parse(data) : {};
};

export const saveLocalTrackRating = (trackRatingData) => {
  const ratings = getLocalTrackRatings();
  const key = `${trackRatingData.album_id}_${trackRatingData.track_id}`;
  ratings[key] = { ...ratings[key], ...trackRatingData };
  localStorage.setItem('soundboxd_track_ratings', JSON.stringify(ratings));
  return ratings;
};

export const deleteTrackRating = async (albumId, trackId) => {
  const ratings = getLocalTrackRatings();
  const key = `${albumId}_${trackId}`;
  delete ratings[key];
  localStorage.setItem('soundboxd_track_ratings', JSON.stringify(ratings));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('track_ratings')
        .delete()
        .eq('album_id', String(albumId))
        .eq('track_id', String(trackId));
    } catch (err) {
      console.warn('Supabase track rating delete error:', err);
    }
  }
  return ratings;
};

export const fetchTrackRatings = async (albumId) => {
  if (isSupabaseConfigured() && supabase && albumId) {
    try {
      const { data, error } = await supabase
        .from('track_ratings')
        .select('*')
        .eq('album_id', String(albumId));
      if (!error && data) {
        const local = getLocalTrackRatings();
        data.forEach(tr => {
          local[`${tr.album_id}_${tr.track_id}`] = tr;
        });
        localStorage.setItem('soundboxd_track_ratings', JSON.stringify(local));
        return local;
      }
    } catch (err) {
      console.warn('Supabase track ratings fetch error', err);
    }
  }
  return getLocalTrackRatings();
};

export const saveTrackRating = async (trackRatingData) => {
  saveLocalTrackRating(trackRatingData);
  if (isSupabaseConfigured() && supabase) {
    try {
      const payload = {
        album_id: String(trackRatingData.album_id),
        track_id: String(trackRatingData.track_id),
        track_name: trackRatingData.track_name,
        artist_name: trackRatingData.artist_name || '',
        rating: Number(trackRatingData.rating),
        is_favorite: Boolean(trackRatingData.is_favorite)
      };
      await supabase.from('track_ratings').upsert(payload);
    } catch (err) {
      console.warn('Supabase track rating insert error:', err);
    }
  }
  return trackRatingData;
};

export const getLocalLists = () => {
  const data = localStorage.getItem('soundboxd_lists');
  if (!data) {
    localStorage.setItem('soundboxd_lists', JSON.stringify(INITIAL_DEMO_LISTS));
    return INITIAL_DEMO_LISTS;
  }
  return JSON.parse(data);
};

export const saveLocalList = (newList) => {
  const lists = getLocalLists();
  const updated = [newList, ...lists];
  localStorage.setItem('soundboxd_lists', JSON.stringify(updated));
  return updated;
};

export const deleteList = async (listId) => {
  const lists = getLocalLists();
  const updated = lists.filter(l => l.id !== listId);
  localStorage.setItem('soundboxd_lists', JSON.stringify(updated));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('lists').delete().eq('id', listId);
    } catch (err) {
      console.warn('Supabase list delete error:', err);
    }
  }
  return updated;
};

// Supabase Async Handlers
export const fetchReviews = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        localStorage.setItem('soundboxd_reviews', JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local storage', err);
    }
  }
  return getLocalReviews();
};

export const createOrUpdateReview = async (reviewData) => {
  saveLocalReview(reviewData); // Save locally immediately
  if (isSupabaseConfigured() && supabase) {
    try {
      const payload = { ...reviewData };
      if (!payload.id || payload.id.startsWith('demo-') || payload.id.startsWith('rev-')) {
        delete payload.id;
      }
      const { data, error } = await supabase.from('reviews').upsert(payload).select();
      if (error) {
        console.error('Erro de inserção no Supabase:', error);
      } else if (data && data[0]) {
        saveLocalReview(data[0]);
      }
    } catch (err) {
      console.warn('Supabase upsert error:', err);
    }
  }
  return reviewData;
};

export const deleteReview = async (id) => {
  deleteLocalReview(id);
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('reviews').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error', err);
    }
  }
};
