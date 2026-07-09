import { getFullImageUrl } from '@/lib/utils';

/** Collect raw image paths from API fields that may be arrays or JSON strings. */
export function collectRawPropertyImagePaths(
  imagesValue: unknown,
  fallbackImageUrl?: string | null
): string[] {
  const result: string[] = [];

  if (Array.isArray(imagesValue)) {
    imagesValue.forEach((img) => {
      if (typeof img === 'string' && img.trim()) {
        result.push(img.trim());
      }
    });
  } else if (typeof imagesValue === 'string' && imagesValue.trim()) {
    const trimmed = imagesValue.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        parsed.forEach((img) => {
          if (typeof img === 'string' && img.trim()) {
            result.push(img.trim());
          }
        });
      } else if (typeof parsed === 'string' && parsed.trim()) {
        result.push(parsed.trim());
      }
    } catch {
      result.push(trimmed);
    }
  }

  if (result.length === 0 && typeof fallbackImageUrl === 'string' && fallbackImageUrl.trim()) {
    result.push(fallbackImageUrl.trim());
  }

  return [...new Set(result)];
}

export function resolvePropertyImageUrls(
  imagesValue: unknown,
  fallbackImageUrl?: string | null
): string[] {
  return collectRawPropertyImagePaths(imagesValue, fallbackImageUrl)
    .map((path) => getFullImageUrl(path))
    .filter(Boolean);
}

export function getPrimaryPropertyImageUrl(
  imagesValue: unknown,
  fallbackImageUrl?: string | null
): string | null {
  const resolved = resolvePropertyImageUrls(imagesValue, fallbackImageUrl);
  return resolved[0] || null;
}

export function getPropertyImageCount(
  imagesValue: unknown,
  fallbackImageUrl?: string | null
): number {
  return collectRawPropertyImagePaths(imagesValue, fallbackImageUrl).length;
}
