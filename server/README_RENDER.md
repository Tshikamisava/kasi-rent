Render deployment notes — KasiRent (server)

Quick goal
- Run the backend on Render, scale instances, and avoid MySQL connection/memory issues.

Required env vars (set these in Render -> Your Service -> Environment):
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET, SESSION_SECRET, CLIENT_URL, PORT
- REDIS_URL (required for socket scaling)
- DB_POOL_MAX, DB_POOL_MIN, DB_POOL_ACQUIRE, DB_POOL_IDLE

Install runtime deps (already applied locally):
```bash
cd server
npm install
npm install redis @socket.io/redis-adapter
```

Redis options
- Quick local test with Docker:
  - docker run -p 6379:6379 --name kasirent-redis -d redis
  - Local REDIS_URL: redis://localhost:6379
- Hosted (recommended for production): Upstash, Render Redis, or another managed Redis. Upstash provides simple REST/URL with auth.
  - Example Upstash URL format: redis://:PASSWORD@us1-upstash-host:PORT

How to set `REDIS_URL` on Render
- Copy the connection URL from your Redis provider and add it as `REDIS_URL` in the service Environment settings.

DB pool sizing (avoid exhausting MySQL connections)
- Each Node process uses a Sequelize pool of up to `DB_POOL_MAX` connections. For P processes, worst-case connections ≈ P * DB_POOL_MAX.
- Formula: DB_POOL_MAX ≤ floor((max_connections - reserved) / instances)
  - `reserved`: connections kept for other services/maintenance (recommend 10–30)
  - `instances`: number of Render instances you will run

Examples
- Example A: MySQL `max_connections=200`, reserved=20
  - instances=1 → (200-20)/1 = 180 → choose DB_POOL_MAX=40–80 depending on workload
  - instances=2 → (200-20)/2 = 90 → choose DB_POOL_MAX=40–80
  - instances=4 → (200-20)/4 = 45 → choose DB_POOL_MAX=30–40
- Example B: Managed DB small plan `max_connections=50`, reserved=5
  - instances=2 → (50-5)/2 = 22 → choose DB_POOL_MAX=10–15

Practical guidance
- Start conservative: set `DB_POOL_MAX` low (8–20) and increase while monitoring.
- Monitor MySQL `Threads_connected` and Render memory usage.
- Use the Redis socket adapter (already implemented) so sockets work across instances and presence isn't stored in-process.
- For heavy background tasks (AI, video), move them to separate worker services to limit memory per web instance.

Verification after deploy
- Check Render logs for:
  - "✅ Socket.io Redis adapter ready"
  - "✅ MySQL Connected successfully"
- If errors appear "MySQL Connection Error" then lower `DB_POOL_MAX` or reduce instance count.
- To inspect Redis presence keys (if you control Redis): `redis-cli keys "online*"` shows `online_users` and `online:<userId>` sets.

Extra notes
- Secure Redis in production (password, VPC, or managed provider). Do not expose plain Redis to the public.
- If you want, tell me your DB `max_connections` and desired instance count and I'll compute recommended `DB_POOL_MAX` values.

