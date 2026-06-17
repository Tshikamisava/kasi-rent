import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "@/lib/apiBase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensure image URL is absolute. If the image path is a relative server path
 * (e.g. /uploads/...), prefix it with the API base URL so hosted clients
 * request the image from the backend server.
 */
export function getFullImageUrl(imagePath?: string | null) {
  if (!imagePath) return '';
  const normalizedPath = imagePath.trim().replace(/[\r\n\t]+/g, '');
  if (!normalizedPath) return '';

  // already absolute (http, https, data URI)
  if (/^(https?:)?\/\//.test(normalizedPath) || normalizedPath.startsWith('data:')) return normalizedPath;

  // Legacy seeded/demo images can be stored as plain filenames that live in client /public
  // e.g. "riverside-townhouse-1.jpg"
  const isPlainFilename = !normalizedPath.includes('/') && /\.[a-zA-Z0-9]+$/.test(normalizedPath);
  if (isPlainFilename) return `/${normalizedPath}`;

  // Explicit server upload path without leading slash
  if (normalizedPath.startsWith('uploads/')) return `${API_BASE_URL}/${normalizedPath}`;

  // Root-relative backend upload path
  if (normalizedPath.startsWith('/uploads/')) return `${API_BASE_URL}${normalizedPath}`;

  // Legacy seeded/demo root file paths (e.g. "/riverside-townhouse-1.jpg")
  // should resolve from client public assets, not backend.
  const isRootRelativePublicFile = /^\/[^/]+\.[a-zA-Z0-9]+$/.test(normalizedPath);
  if (isRootRelativePublicFile) return normalizedPath;

  // If path starts with slash, join with API_BASE
  if (normalizedPath.startsWith('/')) return `${API_BASE_URL}${normalizedPath}`;
  // otherwise assume it's relative to uploads
  return `${API_BASE_URL}/${normalizedPath}`;
}
