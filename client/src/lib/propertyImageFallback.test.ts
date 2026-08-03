import { describe, expect, it } from 'vitest';
import apartmentFallback from '@/assets/riverside-apartment-1.jpg';
import { resolveCardImageUrl, shouldUseFallbackImage } from './propertyImageFallback';

describe('property image fallback', () => {
  const imageUrl = 'https://kasirent.onrender.com/uploads/properties/example.jpg';

  it('uses the real upload URL when the backend has not flagged the image as missing', () => {
    expect(resolveCardImageUrl(imageUrl, 'Apartment')).toBe(imageUrl);
    expect(shouldUseFallbackImage(imageUrl, undefined)).toBe(false);
  });

  it('falls back when the backend explicitly reports the image is missing', () => {
    expect(resolveCardImageUrl(imageUrl, 'Apartment', true)).toBe(apartmentFallback);
    expect(shouldUseFallbackImage(imageUrl, true)).toBe(true);
  });

  it('keeps the real image when the backend explicitly reports it exists', () => {
    expect(resolveCardImageUrl(imageUrl, 'Apartment', false)).toBe(imageUrl);
    expect(shouldUseFallbackImage(imageUrl, false)).toBe(false);
  });
});
