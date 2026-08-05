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

// Initial sample data for rich offline demo
const INITIAL_DEMO_PROFILE = {
  id: 'user-default',
  username: 'leonardohirt',
  full_name: 'Leonardo Hirt',
  avatar_url: '',
  bio: 'Apaixonado por música, descobrindo novos álbuns todos os dias. Fã de MPB, Rock 70s e Synthwave.',
  favorite_artist: 'Daft Punk & Milton Nascimento',
  favorite_genre: 'MPB / Rock / Eletrônica',
  top_four_albums: ['1440857781', '1540328103', '1440872996']
};

const INITIAL_DEMO_REVIEWS = [
  {
    id: 'demo-1',
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
    id: 'demo-2',
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
    id: 'demo-3',
    album_id: '1440872996',
    album_title: 'Abbey Road',
    artist_name: 'The Beatles',
    cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/91/9f/f0/919ff089-a297-c035-ef7c-faed4c2f1f0a/00602508017361.rgb.jpg/600x600bb.jpg',
    release_year: '1969',
    genre: 'Rock',
    rating: 4.5,
    review_text: 'O medly no lado B é o ápice técnico e criativo dos Beatles.',
    listened_date: '2026-08-01',
    is_relisten: true,
    is_favorite: false,
    created_at: new Date(Date.now() - 259200000).toISOString()
  }
];

const INITIAL_DEMO_LISTS = [
  {
    id: 'list-1',
    title: 'Álbuns Essenciais para Ouvir de Madrugada',
    description: 'Vibes noturnas, sintetizadores e MPB suave para se desligar do mundo.',
    created_at: new Date().toISOString(),
    items: [
      { album_id: '1440857781', album_title: 'Random Access Memories', artist_name: 'Daft Punk', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a3/be/02/a3be020c-78db-b035-7140-52efebf00d23/886443927087.jpg/600x600bb.jpg' },
      { album_id: '1540328103', album_title: 'Clube da Esquina', artist_name: 'Milton Nascimento & Lô Borges', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/80/c9/ed/80c9ed3d-a517-91fb-fb28-6bcfa12df93a/724349372124.jpg/600x600bb.jpg' }
    ]
  }
];

// Profile storage helpers
export const getLocalProfile = () => {
  const data = localStorage.getItem('soundboxd_profile');
  if (!data) {
    localStorage.setItem('soundboxd_profile', JSON.stringify(INITIAL_DEMO_PROFILE));
    return INITIAL_DEMO_PROFILE;
  }
  return JSON.parse(data);
};

export const saveLocalProfile = (profileData) => {
  const current = getLocalProfile();
  const updated = { ...current, ...profileData };
  localStorage.setItem('soundboxd_profile', JSON.stringify(updated));
  return updated;
};

export const fetchProfile = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();
      if (!error && data) return data;
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
      await supabase.from('profiles').upsert(profileData);
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
  const index = reviews.findIndex(r => r.id === newReview.id);
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

// Supabase Async Handlers
export const fetchReviews = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local storage', err);
    }
  }
  return getLocalReviews();
};

export const createOrUpdateReview = async (reviewData) => {
  saveLocalReview(reviewData); // save locally first
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('reviews').upsert(reviewData);
    } catch (err) {
      console.warn('Supabase upsert error', err);
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
