(async () => {
  try {
    const root = await fetch('http://localhost:5001/');
    console.log('GET / status:', root.status);
    const text = await root.text();
    console.log('GET / body:', text.slice(0,200));

    const resp = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Robot Test', email: 'robot-test@example.com', password: 'secret123' })
    });
    console.log('/api/auth/register status:', resp.status);
    const body = await resp.text();
    console.log('/api/auth/register body:', body);
  } catch (err) {
    console.error('Request error:', err);
  }
})();
