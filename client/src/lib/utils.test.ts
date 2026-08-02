import { describe, it, expect } from 'vitest';
import { getFullImageUrl } from './utils';

describe('getFullImageUrl', () => {
  it('preserves absolute upload URLs from the backend instead of rewriting them to the frontend origin', () => {
    const url = 'https://kasirent.onrender.com/uploads/properties/example.jpg';
    expect(getFullImageUrl(url)).toBe(url);
  });
});
