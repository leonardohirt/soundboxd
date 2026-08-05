// Music API Service using iTunes API (CORS-free, instant, 30s audio previews)
// and Spotify direct links generator

const ITUNES_BASE_URL = 'https://itunes.apple.com';

// Replace low resolution cover art with high definition 600x600
const getHighResCover = (url) => {
  if (!url) return 'https://via.placeholder.com/600x600/121518/ffffff?text=Sem+Capa';
  return url.replace('100x100bb.jpg', '600x600bb.jpg')
            .replace('100x100bb.png', '600x600bb.jpg')
            .replace('60x60bb.jpg', '600x600bb.jpg');
};

export const searchAlbums = async (term) => {
  if (!term || term.trim().length === 0) return [];
  try {
    const response = await fetch(
      `${ITUNES_BASE_URL}/search?term=${encodeURIComponent(term)}&entity=album&limit=24&country=BR`
    );
    const data = await response.json();
    return (data.results || []).map((item) => ({
      album_id: String(item.collectionId),
      album_title: item.collectionName || item.collectionCensoredName,
      artist_name: item.artistName,
      cover_url: getHighResCover(item.artworkUrl100),
      release_year: item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A',
      genre: item.primaryGenreName || 'Música',
      track_count: item.trackCount || 0,
      copyright: item.copyright || '',
      spotify_url: `https://open.spotify.com/search/${encodeURIComponent(item.artistName + ' ' + item.collectionName)}`
    }));
  } catch (error) {
    console.error('Erro na busca de álbuns:', error);
    return [];
  }
};

export const searchTracks = async (term) => {
  if (!term || term.trim().length === 0) return [];
  try {
    const response = await fetch(
      `${ITUNES_BASE_URL}/search?term=${encodeURIComponent(term)}&entity=song&limit=30&country=BR`
    );
    const data = await response.json();
    return (data.results || []).map((item) => ({
      track_id: String(item.trackId),
      track_name: item.trackCensoredName || item.trackName,
      artist_name: item.artistName,
      album_id: String(item.collectionId),
      album_title: item.collectionName || item.collectionCensoredName,
      cover_url: getHighResCover(item.artworkUrl100),
      preview_url: item.previewUrl,
      release_year: item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A',
      genre: item.primaryGenreName || 'Música',
      spotify_url: `https://open.spotify.com/search/${encodeURIComponent(item.artistName + ' ' + item.trackName)}`
    }));
  } catch (error) {
    console.error('Erro na busca de músicas:', error);
    return [];
  }
};

export const searchAll = async (term) => {
  if (!term || term.trim().length === 0) return { albums: [], tracks: [] };
  const [albums, tracks] = await Promise.all([
    searchAlbums(term),
    searchTracks(term)
  ]);
  return { albums, tracks };
};

export const getAlbumDetails = async (albumId) => {
  if (!albumId) return null;
  try {
    const response = await fetch(
      `${ITUNES_BASE_URL}/lookup?id=${albumId}&entity=song&country=BR`
    );
    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const albumInfo = data.results[0]; // First element is album info
    const tracks = data.results.slice(1).map((track) => ({
      track_id: String(track.trackId),
      track_number: track.trackNumber,
      track_name: track.trackCensoredName || track.trackName,
      duration_ms: track.trackTimeMillis,
      preview_url: track.previewUrl,
      artist_name: track.artistName
    }));

    return {
      album_id: String(albumInfo.collectionId),
      album_title: albumInfo.collectionName,
      artist_name: albumInfo.artistName,
      cover_url: getHighResCover(albumInfo.artworkUrl100),
      release_year: albumInfo.releaseDate ? albumInfo.releaseDate.substring(0, 4) : 'N/A',
      release_full_date: albumInfo.releaseDate ? new Date(albumInfo.releaseDate).toLocaleDateString('pt-BR') : '',
      genre: albumInfo.primaryGenreName || 'Música',
      copyright: albumInfo.copyright || '',
      spotify_url: `https://open.spotify.com/search/${encodeURIComponent(albumInfo.artistName + ' ' + albumInfo.collectionName)}`,
      tracks
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do álbum:', error);
    return null;
  }
};

// Curated list of trending & iconic albums for homepage discovery
export const getTrendingAlbums = async () => {
  const trendingQueries = [
    'Daft Punk Random Access Memories',
    'Milton Nascimento Clube da Esquina',
    'Kendrick Lamar To Pimp A Butterfly',
    'Billie Eilish HIT ME HARD AND SOFT',
    'Radiohead In Rainbows',
    'Rosalía MOTOMAMI',
    'Pink Floyd The Dark Side of the Moon',
    'Tim Maia Racional',
    'Tyler The Creator IGOR',
    'Fleetwood Mac Rumours',
    'Charlie Brown Jr Preço Curto Prazo Longo',
    'Gorillaz Demon Days'
  ];

  try {
    const promises = trendingQueries.map(q => searchAlbums(q));
    const results = await Promise.all(promises);
    // Grab first album from each search
    const albums = results.map(r => r[0]).filter(Boolean);
    return albums;
  } catch (err) {
    console.error('Erro ao carregar tendências:', err);
    return [];
  }
};
