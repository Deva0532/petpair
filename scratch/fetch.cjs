const fetch = require('node-fetch');

async function testWishlist() {
  const email = 'testuser_' + Date.now() + '@example.com';
  
  // Register
  const registerRes = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test',
      email: email,
      password: 'password',
      location: 'Test Location',
      otp: '123456' 
    })
  });
  console.log('Register Res:', registerRes.status);
  // This will fail because of OTP.
  // Instead, login as an existing user. Do we have a token?
}
testWishlist();
