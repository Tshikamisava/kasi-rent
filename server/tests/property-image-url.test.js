import test from 'node:test';
import assert from 'node:assert/strict';
import { getRequestBaseUrl, normalizePropertyImagePath, normalizePropertyImageList } from '../utils/propertyImageUrls.js';

test('rewrites upload paths to the current request host', () => {
  const req = {
    protocol: 'http',
    get: (header) => (header === 'host' ? 'localhost:5001' : undefined),
  };

  const baseUrl = getRequestBaseUrl(req);
  assert.equal(baseUrl, 'http://localhost:5001');
  assert.equal(
    normalizePropertyImagePath('https://kasirent.onrender.com/uploads/properties/example.jpg', baseUrl),
    'http://localhost:5001/uploads/properties/example.jpg'
  );
});

test('preserves non-upload external image URLs', () => {
  const externalUrl = 'https://images.unsplash.com/photo-123';
  assert.equal(normalizePropertyImagePath(externalUrl, 'http://localhost:5001'), externalUrl);
});

test('splits comma-delimited image lists into individual URLs', () => {
  const result = normalizePropertyImageList(
    'https://kasirent.onrender.com/uploads/properties/one.jpg, https://kasirent.onrender.com/uploads/properties/two.jpg',
    'http://localhost:5001',
    'https://kasi-rent-seven.vercel.app'
  );

  assert.deepEqual(result, [
    'http://localhost:5001/uploads/properties/one.jpg',
    'http://localhost:5001/uploads/properties/two.jpg'
  ]);
});
