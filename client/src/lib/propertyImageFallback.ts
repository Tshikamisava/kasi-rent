import apartmentFallback from '@/assets/riverside-apartment-1.jpg';
import houseFallback from '@/assets/riverside-house-1.jpg';
import studioFallback from '@/assets/riverside-studio-1.jpg';
import townhouseFallback from '@/assets/riverside-townhouse-1.jpg';
import defaultFallback from '@/assets/landlord-property.jpg';

const renderUploadsRegex = /^https?:\/\/kasirent\.onrender\.com\/uploads\/properties\//i;
const placeholderProbeCache = new Map<string, boolean>();

export function isRenderUploadImageUrl(url?: string | null) {
  if (!url) return false;
  return renderUploadsRegex.test(url);
}

export function getFallbackImageForPropertyType(propertyType?: string | null) {
  const type = String(propertyType || '').trim().toLowerCase();

  if (type.includes('townhouse')) return townhouseFallback;
  if (type.includes('apartment') || type.includes('flat')) return apartmentFallback;
  if (type.includes('studio') || type.includes('bachelor') || type.includes('room')) return studioFallback;
  if (type.includes('house') || type.includes('home')) return houseFallback;

  return defaultFallback;
}

export function shouldProbeRenderUploadImage(url?: string | null) {
  return isRenderUploadImageUrl(url);
}

export function shouldUseFallbackImage(
  imageUrl: string | null | undefined,
  imageMissing?: boolean | null
) {
  if (imageMissing === true) return true;
  if (imageMissing === false) return false;

  // Backward-compatible fallback for deployments where image_missing
  // is not yet returned by the backend API.
  return isRenderUploadImageUrl(imageUrl);
}

export function resolveCardImageUrl(
  imageUrl: string | null | undefined,
  propertyType?: string | null,
  imageMissing?: boolean | null
) {
  if (!imageUrl || shouldUseFallbackImage(imageUrl, imageMissing)) {
    return getFallbackImageForPropertyType(propertyType);
  }

  return imageUrl;
}

export async function isRenderPlaceholderSvg(url: string): Promise<boolean> {
  if (!shouldProbeRenderUploadImage(url)) return false;

  const cached = placeholderProbeCache.get(url);
  if (typeof cached === 'boolean') return cached;

  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const isPlaceholder = contentType.includes('image/svg+xml');
    placeholderProbeCache.set(url, isPlaceholder);
    return isPlaceholder;
  } catch {
    placeholderProbeCache.set(url, false);
    return false;
  }
}