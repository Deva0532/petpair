async function testBackend() {
  try {
    // 1. Register user
    const email = 'normal_' + Date.now() + '@example.com';
    let res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Normal User',
        email: email,
        password: 'password123',
        location: 'Mumbai'
      })
    });
    // This will return 400 because of missing OTP.
    console.log('Register status:', res.status);
    let data = await res.json();
    console.log('Register response:', data);

    // Let's connect directly to mongod to bypass OTP
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/petpair');
    const { Schema } = mongoose;
    const userSchema = new Schema({}, { strict: false });
    const User = mongoose.model('FakeUser', userSchema, 'users');
    const Wishlist = mongoose.model('FakeWishlist', new Schema({}, { strict: false }), 'wishlists');

    // Find any normal user
    const normalUser = await User.findOne({ userType: 'normal' }) || await User.findOne({ role: 'user' });
    if (!normalUser) {
        console.log("NO NORMAL USER FOUND");
        return;
    }
    console.log('Found normal user:', normalUser._id);
    
    // Find wishlist count
    const wishItems = await Wishlist.find({ userId: normalUser._id });
    console.log('Wishlist items directly from DB:', wishItems.length, wishItems);

    process.exit(0);

  } catch(e) {
      console.log('Error:', e);
      process.exit(1);
  }
}

testBackend();
