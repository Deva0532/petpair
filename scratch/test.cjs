const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/petpair', { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Wishlist = mongoose.model('Wishlist', new mongoose.Schema({}, { strict: false }));
  
  const normalUser = await User.findOne({ userType: 'normal' });
  if (!normalUser) {
    console.log('No normal user found');
  } else {
    console.log('Found Normal User:', normalUser._id);
    const w = await Wishlist.find({ userId: normalUser._id });
    console.log('Wishlist items:', w);
  }
  
  process.exit(0);
}
run();
