import { storage } from "./secureStrorage";

// Ganti dengan URL deployment backend kamu, mis. https://movie-app-backend.vercel.app
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL!;

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

async function saveTokens(accessToken: string, refreshToken: string) {
  await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

async function clearTokens() {
  await storage.deleteItem(ACCESS_TOKEN_KEY);
  await storage.deleteItem(REFRESH_TOKEN_KEY);
}

async function getAccessToken() {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

async function refreshAccessToken() {
  const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    await clearTokens();
    return null;
  }
  const data = await res.json();
  await saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

// Wrapper fetch yang otomatis pasang Authorization header & auto-refresh sekali jika 401
export async function apiFetch(path: string, options: RequestInit = {}) {
  let token = await getAccessToken();

  const doFetch = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    });

  let res = await doFetch(token);

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await doFetch(newToken);
  }

  return res;
}

// ================= AUTH =================

export const signUp = async (email: string, password: string, name: string) => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal mendaftar");

  await saveTokens(data.accessToken, data.refreshToken);
  return data.user;
};

export const signIn = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal masuk");

  await saveTokens(data.accessToken, data.refreshToken);
  return data.user;
};

export const signOut = async () => {
  await clearTokens();
};

export const getCurrentUser = async () => {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await apiFetch("/auth/me");
  if (!res.ok) return null;
  return res.json();
};

// ================= SAVED MOVIES =================

export const isMovieSaved = async (movieId: number) => {
  const res = await apiFetch(`/movies/saved/${movieId}`);
  if (!res.ok) return null;
  return res.json();
};

export const saveMovie = async (movie: Movie) => {
  const res = await apiFetch("/movies/saved", {
    method: "POST",
    body: JSON.stringify({
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menyimpan film");
  return data;
};

export const unsaveMovie = async (docId: string) => {
  const res = await apiFetch(`/movies/saved/${docId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Gagal menghapus film");
};

export const updateSavedMovie = async (
  docId: string,
  data: { note?: string; rating?: number },
) => {
  const res = await apiFetch(`/movies/saved/${docId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal memperbarui film");
  return res.json();
};

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
  const res = await apiFetch("/movies/saved");
  if (!res.ok) return [];
  return res.json();
};

// ================= PROFILE =================

export const getProfile = async (): Promise<UserProfile | null> => {
  const res = await apiFetch("/movies/profile");
  if (!res.ok) return null;
  return res.json();
};

export const updateProfile = async (
  _docId: string,
  data: Partial<UserProfile>,
) => {
  const res = await apiFetch("/movies/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal memperbarui profil");
  return res.json();
};

// ================= SEARCH & TRENDING =================

export const updateSearchCount = async (query: string, movie: Movie) => {
  await apiFetch("/movies/search-count", {
    method: "POST",
    body: JSON.stringify({ query, movie }),
  });
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  const res = await apiFetch("/movies/trending");
  if (!res.ok) return undefined;
  return res.json();
};
