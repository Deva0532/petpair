import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_super_secret_key';
const GOOGLE_CLIENT_ID = '491619630108-3e8nu5ocp54e5kjgb79rms5cqa91b847.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb+srv://myAtlasDBUser:deva@myatlasclusteredu.hjsgp.mongodb.net/PetPair';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  location: { type: String, default: 'Not specified' },
  phone: { type: String, default: '' },
  bio: { type: String, default: 'Edit your bio to share your passion for pets!' },
  googleId: { type: String },
  avatar: { type: String },
});

const User = mongoose.model('User', userSchema);

// Auth Middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// --- GOOGLE AUTH ENDPOINT ---
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Google credential is required' });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId, avatar: picture, location: 'Not specified' });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      await user.save();
    }
    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name, location: user.location, phone: user.phone, bio: user.bio }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: 'Google login successful', token });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// --- USER ENDPOINTS ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.password) return res.status(401).json({ message: 'Please sign in with Google' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name, location: user.location, phone: user.phone, bio: user.bio }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, location } = req.body;
  if (!name || !email || !password || !location) return res.status(400).json({ general: 'All required fields must be provided.' });
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ general: 'User with this email already exists.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, location });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id, email: newUser.email, name: newUser.name, location: newUser.location, phone: newUser.phone, bio: newUser.bio }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ general: 'Server error during registration.' });
  }
});

app.put('/api/profile', protect, async (req, res) => {
  const { name, location, phone, bio } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name ?? user.name;
    user.location = location ?? user.location;
    user.phone = phone ?? user.phone;
    user.bio = bio ?? user.bio;
    const updatedUser = await user.save();
    const newToken = jwt.sign({ userId: updatedUser._id, email: updatedUser.email, name: updatedUser.name, location: updatedUser.location, phone: updatedUser.phone, bio: updatedUser.bio }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Profile updated successfully', token: newToken });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// --- PET SCHEMA ---
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  customBreed: { type: String },
  age: { type: Number, required: true },
  type: { type: String, required: true },
  customType: { type: String },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  price: { type: Number },
  location: { type: String, required: true },
  description: { type: String, required: true },
  vaccinated: { type: Boolean, default: false },
  neutered: { type: Boolean, default: false },
  availableForMating: { type: Boolean, default: false },
  availableForSale: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  imageUrls: [{ type: String }],
  weight: { type: Number },
  personality: [{ type: String }],
  careRequirements: { exercise: { type: String }, space: { type: String } },
  medicalNotes: { type: String },
  healthProblems: [{ type: String }],
  size: { type: String, enum: ['small', 'medium', 'large', 'extra-large'] },
  activityLevel: { type: String, enum: ['low', 'moderate', 'high'] },
  goodWithKids: { type: Boolean, default: false },
  goodWithPets: { type: Boolean, default: false },
  houseTrained: { type: Boolean, default: false },
  spayedNeutered: { type: Boolean, default: false },
  specialNeeds: { type: Boolean, default: false },
  healthRecords: [{
    visitType: { type: String, required: true },
    date: { type: Date, required: true },
    notes: { type: String },
    vetName: { type: String }
  }],
  status: { type: String, enum: ['active', 'sold', 'deleted'], default: 'active' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// --- WISHLIST SCHEMA ---
const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  addedAt: { type: Date, default: Date.now }
});
wishlistSchema.index({ userId: 1, petId: 1 }, { unique: true });

// --- PREFERENCES SCHEMA ---
const preferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  marketingEmails: { type: Boolean, default: false },
  profileVisibility: { type: String, default: 'public' },
  showLocation: { type: Boolean, default: true },
  showContact: { type: Boolean, default: false }
});

const Pet = mongoose.model('Pet', petSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Preferences = mongoose.model('Preferences', preferencesSchema);

// --- PET ENDPOINTS ---
app.post('/api/pets', protect, async (req, res) => {
  try {
    const pet = new Pet({ ...req.body, ownerId: req.user.userId, status: 'active' });
    const savedPet = await pet.save();
    res.status(201).json(savedPet);
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ message: 'Server error creating pet' });
  }
});

app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).populate('ownerId', 'name email location phone bio');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pets' });
  }
});

app.get('/api/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('ownerId', 'name email location phone bio');
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Pet not found' });
    res.status(500).json({ message: 'Server error fetching pet details' });
  }
});

app.put('/api/pets/:id', protect, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (pet.ownerId.toString() !== req.user.userId) return res.status(403).json({ message: 'Not authorized to edit this pet' });
    const allowedUpdates = ['name', 'breed', 'customBreed', 'age', 'type', 'customType', 'gender', 'price', 'location', 'description',
      'vaccinated', 'neutered', 'availableForMating', 'availableForSale', 'featured', 'imageUrls', 'weight', 'personality',
      'careRequirements', 'medicalNotes', 'healthProblems', 'size', 'activityLevel', 'goodWithKids', 'goodWithPets', 'houseTrained',
      'spayedNeutered', 'specialNeeds', 'healthRecords', 'status'];
    allowedUpdates.forEach(field => { if (req.body[field] !== undefined) pet[field] = req.body[field]; });
    const updatedPet = await pet.save();
    await updatedPet.populate('ownerId', 'name email location phone bio');
    res.json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: 'Server error updating pet' });
  }
});

app.delete('/api/pets/:id', protect, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (pet.ownerId.toString() !== req.user.userId) return res.status(403).json({ message: 'Not authorized to delete this pet' });
    pet.status = 'deleted';
    await pet.save();
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ message: 'Server error deleting pet' });
  }
});

// --- WISHLIST ENDPOINTS ---
app.get('/api/wishlist', protect, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.user.userId })
      .populate({ path: 'petId', populate: { path: 'ownerId', select: 'name email location phone bio' } })
      .sort({ addedAt: -1 });
    const items = wishlistItems.map(item => ({
      id: item._id,
      addedAt: item.addedAt,
      pet: item.petId ? {
        ...item.petId.toObject(),
        id: item.petId._id,
        image: item.petId.imageUrls?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
        owner: item.petId.ownerId ? { ...item.petId.ownerId.toObject(), id: item.petId.ownerId._id } : null
      } : null
    }));
    res.json(items);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
});

app.post('/api/wishlist/:petId', protect, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    const existing = await Wishlist.findOne({ userId: req.user.userId, petId: req.params.petId });
    if (existing) return res.status(400).json({ message: 'Pet already in wishlist' });
    const wishlistItem = new Wishlist({ userId: req.user.userId, petId: req.params.petId });
    await wishlistItem.save();
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
});

app.delete('/api/wishlist/:petId', protect, async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ userId: req.user.userId, petId: req.params.petId });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error removing from wishlist' });
  }
});

// --- PREFERENCES ENDPOINTS ---
app.get('/api/preferences', protect, async (req, res) => {
  try {
    let prefs = await Preferences.findOne({ userId: req.user.userId });
    if (!prefs) { prefs = new Preferences({ userId: req.user.userId }); await prefs.save(); }
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching preferences' });
  }
});

app.put('/api/preferences', protect, async (req, res) => {
  try {
    const prefs = await Preferences.findOneAndUpdate({ userId: req.user.userId }, { $set: req.body }, { new: true, upsert: true });
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });