import { useAuth } from "@/hooks/use-auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export type ApiOptions = RequestInit & { absolute?: boolean };

export async function apiFetch(path: string, opts: ApiOptions = {}) {
  const { absolute = false, ...init } = opts;

  const url = absolute ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  // Prefer token from zustand store, fall back to localStorage
  const state = useAuth.getState();
  let token = state?.user?.token || null;
  if (!token) {
    try {
      token = localStorage.getItem('token');
    } catch (e) {
      // ignore
    }
  }

  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401) {
    // Unauthorized - clear stored auth and redirect to sign in
    try {
      useAuth.getState().logout();
    } catch (e) {
      console.warn('Failed to call logout on auth store', e);
    }
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
    } catch (e) { /* ignore */ }

    // Give a console hint and redirect user to sign in page
    console.warn('API returned 401 — clearing auth and redirecting to /signin');
    if (typeof window !== 'undefined') window.location.href = '/signin';

    // Reject so callers know the request failed
    throw new Error('Unauthorized');
  }

  return response;
}

export async function apiJson(path: string, opts: ApiOptions = {}) {
  const res = await apiFetch(path, opts);
  const text = await res.text();
  try {
    return JSON.parse(text || '{}');
  } catch (e) {
    return text;
  }
}

export default apiFetch;
