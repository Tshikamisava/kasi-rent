const LOCAL_API_FALLBACK = 'http://localhost:5001';
const PROD_API_FALLBACK = 'https://kasirent.onrender.com';

function fallbackApiBase() {
  return import.meta.env.PROD ? PROD_API_FALLBACK : LOCAL_API_FALLBACK;
}

function normalizeApiBase(raw?: string) {
  const value = (raw || '').trim().replace(/\/+$/, '');
  if (!value) return fallbackApiBase();

  try {
    const parsed = new URL(value);

    // Handle a common typo seen in env setup: onrender.co -> onrender.com
    if (parsed.hostname === 'kasirent.onrender.co') {
      parsed.hostname = 'kasirent.onrender.com';
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return fallbackApiBase();
    }

    return parsed.origin;
  } catch {
    return fallbackApiBase();
  }
}

export const API_BASE_URL = normalizeApiBase(import.meta.env.VITE_API_URL);
