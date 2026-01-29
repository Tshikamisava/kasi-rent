import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeRole } from '../middleware/authorizeRole.js';

test('authorizeRole - returns 401 when no user', async (t) => {
  const middleware = authorizeRole(['admin']);
  const req = {}; // no user

  let statusCode, jsonBody;
  const res = {
    status(code) { statusCode = code; return this; },
    json(obj) { jsonBody = obj; }
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  middleware(req, res, next);

  assert.equal(statusCode, 401);
  assert.equal(jsonBody?.message, 'Not authorized');
  assert.equal(nextCalled, false);
});

test('authorizeRole - returns 403 when role not allowed', async (t) => {
  const middleware = authorizeRole(['landlord','admin']);
  const req = { user: { role: 'tenant' } };

  let statusCode, jsonBody;
  const res = {
    status(code) { statusCode = code; return this; },
    json(obj) { jsonBody = obj; }
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  middleware(req, res, next);

  assert.equal(statusCode, 403);
  assert.equal(jsonBody?.message, 'Forbidden: insufficient role');
  assert.equal(nextCalled, false);
});

test('authorizeRole - calls next when role allowed', async (t) => {
  const middleware = authorizeRole(['landlord','admin']);
  const req = { user: { role: 'landlord' } };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  middleware(req, {}, next);

  assert.equal(nextCalled, true);
});
