import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testRegistration() {
  console.log('=== TESTING REGISTRATION ===');
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '0123456789',
        role: 'tenant'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Registration successful!');
      return data;
    } else {
      console.log('❌ Registration failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return null;
  }
}

async function testLogin() {
  console.log('\n=== TESTING LOGIN ===');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login successful!');
      return data;
    } else {
      console.log('❌ Login failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

async function runTests() {
  const regResult = await testRegistration();
  if (regResult) {
    await testLogin();
  }
}

runTests();
