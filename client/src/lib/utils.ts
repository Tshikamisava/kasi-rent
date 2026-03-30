import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  // already absolute (http, https, data URI)
  if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith('data:')) return imagePath;

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, '');
  // If path starts with slash, join with API_BASE
  if (imagePath.startsWith('/')) return `${API_BASE}${imagePath}`;
  // otherwise assume it's relative to uploads
  return `${API_BASE}/${imagePath}`;
}
