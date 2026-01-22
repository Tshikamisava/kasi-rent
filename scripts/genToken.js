const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'kasirent_jwt_secret_key_2025_super_secure';
const token = jwt.sign({ id: 1, email: 'admin@example.com', role: 'admin' }, secret, { expiresIn: '7d' });
console.log(token);
