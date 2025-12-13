import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// --- NODEMAILER TRANSPORTER ---
// Configure this in your .env file
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Nodemailer error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

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
  // New fields for pet stores & admin
  userType: { type: String, enum: ['individual', 'store'], default: 'individual' },
  isNewUser: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  mobileVerified: { type: Boolean, default: false },
  storeApproved: { type: Boolean, default: false },
  storeRejected: { type: Boolean, default: false },
  storeName: { type: String },
  storeDescription: { type: String },
  storeAddress: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

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

// Admin Middleware - checks if user is admin
const ADMIN_EMAIL = 'varunrockes2004@gmail.com';
const isAdmin = (req, res, next) => {
  if (req.user.email !== ADMIN_EMAIL && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Helper to generate JWT token with all user fields
const generateToken = (user) => {
  return jwt.sign({
    userId: user._id,
    email: user.email,
    name: user.name,
    location: user.location,
    phone: user.phone,
    bio: user.bio,
    avatar: user.avatar,
    joinedAt: user.createdAt,
    userType: user.userType,
    isNewUser: user.isNewUser,
    emailVerified: user.emailVerified,
    mobileVerified: user.mobileVerified,
    storeApproved: user.storeApproved,
    storeRejected: user.storeRejected,
    storeName: user.storeName,
    storeDescription: user.storeDescription,
    storeAddress: user.storeAddress,
    role: user.email === ADMIN_EMAIL ? 'admin' : user.role
  }, JWT_SECRET, { expiresIn: '24h' });
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
    let isNewGoogleUser = false;

    // Check if this is the admin email
    const isAdminEmail = email === ADMIN_EMAIL;

    if (!user) {
      // For admin, auto-configure as not new and set role
      user = new User({
        name,
        email,
        googleId,
        avatar: picture,
        location: 'Not specified',
        isNewUser: isAdminEmail ? false : true, // Admin doesn't need to select user type
        userType: 'individual',
        role: isAdminEmail ? 'admin' : 'user'
      });
      await user.save();
      isNewGoogleUser = !isAdminEmail; // Only mark as new if not admin
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      // If admin and still marked as new, auto-configure
      if (isAdminEmail && user.isNewUser) {
        user.isNewUser = false;
        user.role = 'admin';
      }
      await user.save();
    } else if (isAdminEmail && user.isNewUser) {
      // Existing admin user but still marked as new - fix it
      user.isNewUser = false;
      user.role = 'admin';
      await user.save();
    }
    const token = generateToken(user);
    res.status(200).json({ message: 'Google login successful', token, isNewUser: user.isNewUser });
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
    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/send-verification-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save or update verification code
    await VerificationCode.findOneAndUpdate(
      { email },
      { code: hashedOtp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 mins
      { upsert: true }
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email for Petpair',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Verification code sent' });

  } catch (error) {
    console.error('Send verification OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, location, otp } = req.body;
  if (!name || !email || !password || !location || !otp) return res.status(400).json({ general: 'All fields including OTP are required.' });
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ general: 'User with this email already exists.' });

    // Verify OTP
    const verificationEntry = await VerificationCode.findOne({ email });
    if (!verificationEntry) {
      return res.status(400).json({ general: 'Verification code expired or not found. Please resend.' });
    }
    if (verificationEntry.expiresAt < new Date()) {
      return res.status(400).json({ general: 'Verification code expired. Please resend.' });
    }
    const isMatch = await bcrypt.compare(otp, verificationEntry.code);
    if (!isMatch) {
      return res.status(400).json({ general: 'Invalid verification code.' });
    }

    // Proceed with registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, location });
    await newUser.save();

    // Clear OTP
    await VerificationCode.deleteOne({ email });

    const token = generateToken(newUser);
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ general: 'Server error during registration.' });
  }
});

app.put('/api/profile', protect, async (req, res) => {
  const { name, location, phone, bio, avatar } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name ?? user.name;
    user.location = location ?? user.location;
    user.phone = phone ?? user.phone;
    user.bio = bio ?? user.bio;
    if (avatar !== undefined) user.avatar = avatar;
    const updatedUser = await user.save();
    const newToken = generateToken(updatedUser);
    res.json({ message: 'Profile updated successfully', token: newToken, avatar: updatedUser.avatar });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// --- FORGOT PASSWORD ENDPOINTS ---

// 1. Send OTP
// 1. Send OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Security: don't reveal if user exists
      return res.status(200).json({ message: 'If that email exists, we have sent an OTP.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save or update verification code in separate collection
    console.log(`Attempting to save OTP for ${email}...`);
    const savedCode = await VerificationCode.findOneAndUpdate(
      { email },
      {
        email, // Explicitly set email to ensure it's saved on upsert
        code: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('OTP saved result:', savedCode);

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Reset OTP - PetPair',
      text: `Your OTP for password reset is: ${otp}\n\nIt expires in 10 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).json({ message: 'If that email exists, we have sent an OTP.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Reset Password
// 2. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // 1. Verify OTP first
    const verificationEntry = await VerificationCode.findOne({ email });
    if (!verificationEntry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check expiry
    if (verificationEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Verify Hash
    const isMatch = await bcrypt.compare(otp, verificationEntry.code);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    // 2. Find User and Update Password
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    // user.resetPasswordOtp = undefined; // No longer needed
    // user.resetPasswordExpires = undefined; // No longer needed
    await user.save();

    // 3. Delete OTP
    await VerificationCode.deleteOne({ email });

    res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Change Password (Logged In)
app.put('/api/auth/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user has a password (google auth users might not)
    if (!user.password) {
      return res.status(400).json({ message: 'You are logged in via Google. Please use "Forgot Password?" to set a password.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Update to new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Delete Account
app.delete('/api/auth/delete-account', protect, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascading delete
    await Preferences.deleteOne({ userId });
    await Wishlist.deleteMany({ userId });
    await VerificationCode.deleteMany({ email: user.email });
    await Pet.deleteMany({ ownerId: userId });

    // Finally delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// --- VERIFICATION CODE SCHEMA ---
const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { collection: 'otp' });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

// --- PET SCHEMA ---
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  customBreed: { type: String },
  age: { type: Number, required: true },
  type: { type: String, required: true },
  customType: { type: String },
  gender: { type: String, enum: ['male', 'female', 'Male', 'Female'] },
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
  size: { type: String, enum: ['small', 'medium', 'large', 'extra-large', 'Small', 'Medium', 'Large', 'Extra-Large'] },
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

// --- REVIEW SCHEMA ---
const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }, // Optional: review related to a specific pet transaction
  createdAt: { type: Date, default: Date.now }
});
// Prevent duplicate reviews from same user
reviewSchema.index({ reviewerId: 1, reviewedUserId: 1 }, { unique: true });

// --- VET SCHEMA ---
const vetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  location: { type: String },
  address: { type: String },
  phone: { type: String },
  image: { type: String },
  emergencyService: { type: Boolean, default: false },
  availableDays: [{ type: String }], // e.g., ['Monday', 'Tuesday', 'Wednesday']
  availableTime: { type: String }, // e.g., '9:00 AM - 6:00 PM'
  createdAt: { type: Date, default: Date.now }
});

// --- NOTIFICATION SCHEMA ---
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
notificationSchema.index({ userId: 1, createdAt: -1 });

const Pet = mongoose.model('Pet', petSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Preferences = mongoose.model('Preferences', preferencesSchema);
const Review = mongoose.model('Review', reviewSchema);
const Vet = mongoose.model('Vet', vetSchema);
const Notification = mongoose.model('Notification', notificationSchema);

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
    const pets = await Pet.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).populate('ownerId', 'name email location phone bio avatar emailVerified mobileVerified createdAt');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pets' });
  }
});

app.get('/api/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('ownerId', 'name email location phone bio avatar emailVerified mobileVerified createdAt');
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

// --- USER TYPE & STORE REGISTRATION ---
app.post('/api/auth/set-user-type', protect, async (req, res) => {
  const { userType, storeName, storeDescription, storeAddress } = req.body;
  if (!userType || !['individual', 'store'].includes(userType)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.userType = userType;
    user.isNewUser = false;

    if (userType === 'store') {
      if (!storeName) return res.status(400).json({ message: 'Store name is required' });
      user.storeName = storeName;
      user.storeDescription = storeDescription || '';
      user.storeAddress = storeAddress || user.location;
      user.storeApproved = false;
      user.storeRejected = false;
    }

    await user.save();
    const token = generateToken(user);
    res.json({ message: 'User type set successfully', token });
  } catch (error) {
    console.error('Set user type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- PROFILE OTP VERIFICATION ---
app.post('/api/auth/send-profile-otp', protect, async (req, res) => {
  const { type, value } = req.body; // type: 'email' or 'mobile', value: email address or phone number
  if (!type || !value) return res.status(400).json({ message: 'Type and value are required' });

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save OTP with identifier (email_verify_userid or mobile_verify_userid)
    const identifier = `${type}_verify_${user._id}`;
    await VerificationCode.findOneAndUpdate(
      { email: identifier },
      { code: hashedOtp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true }
    );

    if (type === 'email') {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: value,
        subject: 'Verify your email - PetPair',
        text: `Your verification code is: ${otp}. It expires in 10 minutes.`
      };
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Verification code sent to email' });
    } else if (type === 'mobile') {
      // For mobile, we'll just log it for now (needs SMS service integration)
      console.log(`[MOCK SMS] OTP for ${value}: ${otp}`);
      res.json({ message: 'Verification code sent to mobile (mocked)', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
    }
  } catch (error) {
    console.error('Send profile OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/verify-profile-otp', protect, async (req, res) => {
  const { type, otp } = req.body; // type: 'email' or 'mobile'
  if (!type || !otp) return res.status(400).json({ message: 'Type and OTP are required' });

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const identifier = `${type}_verify_${user._id}`;
    const verificationEntry = await VerificationCode.findOne({ email: identifier });

    if (!verificationEntry) {
      return res.status(400).json({ message: 'Verification code not found or expired' });
    }
    if (verificationEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    const isMatch = await bcrypt.compare(otp, verificationEntry.code);
    if (!isMatch) return res.status(400).json({ message: 'Invalid verification code' });

    // Update user verification status
    if (type === 'email') {
      user.emailVerified = true;
    } else if (type === 'mobile') {
      user.mobileVerified = true;
    }
    await user.save();

    // Delete OTP
    await VerificationCode.deleteOne({ email: identifier });

    const token = generateToken(user);
    res.json({ message: `${type} verified successfully`, token });
  } catch (error) {
    console.error('Verify profile OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- STORES ENDPOINTS ---
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await User.find({ userType: 'store', storeApproved: true })
      .select('name email storeName storeDescription storeAddress location avatar emailVerified mobileVerified');
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Server error fetching stores' });
  }
});

app.get('/api/stores/:id', async (req, res) => {
  try {
    const store = await User.findOne({ _id: req.params.id, userType: 'store', storeApproved: true })
      .select('name email storeName storeDescription storeAddress location avatar emailVerified mobileVerified phone bio');
    if (!store) return res.status(404).json({ message: 'Store not found' });

    // Get pets listed by this store
    const pets = await Pet.find({ ownerId: req.params.id, status: 'active' });
    res.json({ store, pets });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Server error fetching store' });
  }
});

// --- ADMIN ENDPOINTS ---
app.get('/api/admin/stats', protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPets = await Pet.countDocuments({ status: { $ne: 'deleted' } });
    const pendingApprovals = await User.countDocuments({ userType: 'store', storeApproved: false, storeRejected: false });
    const activeStores = await User.countDocuments({ userType: 'store', storeApproved: true });
    const individualUsers = await User.countDocuments({ userType: 'individual' });

    res.json({ totalUsers, totalPets, pendingApprovals, activeStores, individualUsers });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', protect, isAdmin, async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type && ['individual', 'store'].includes(type)) query.userType = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting admin
    if (user.email === ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Cannot delete admin account' });
    }

    // Send notification email before deleting
    if (reason) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Account Removal Notice - PetPair',
        text: `Dear ${user.name},\n\nWe regret to inform you that your account on PetPair has been removed by our admin team.\n\nReason: ${reason}\n\nIf you believe this was a mistake or have any questions, please contact our support team.\n\nBest regards,\nThe PetPair Team`
      };
      transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));
    }

    // Cascading delete
    await Preferences.deleteOne({ userId });
    await Wishlist.deleteMany({ userId });
    await VerificationCode.deleteMany({ email: user.email });
    await Pet.deleteMany({ ownerId: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/pets', protect, isAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const pets = await Pet.find(query)
      .populate('ownerId', 'name email storeName userType')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Pet.countDocuments(query);

    res.json({ pets, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin pets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/pets/:id', protect, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const pet = await Pet.findById(req.params.id).populate('ownerId', 'name email');
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // Send notification email to owner
    if (reason && pet.ownerId && pet.ownerId.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: pet.ownerId.email,
        subject: 'Pet Listing Removed - PetPair',
        text: `Dear ${pet.ownerId.name},\n\nWe regret to inform you that your pet listing "${pet.name}" (${pet.breed}) has been removed from PetPair by our admin team.\n\nReason: ${reason}\n\nIf you believe this was a mistake or have any questions, please contact our support team.\n\nBest regards,\nThe PetPair Team`
      };
      transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));
    }

    pet.status = 'deleted';
    await pet.save();
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Admin delete pet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/store-approvals', protect, isAdmin, async (req, res) => {
  try {
    const pendingStores = await User.find({ userType: 'store', storeApproved: false, storeRejected: false })
      .select('-password')
      .sort({ _id: -1 });
    res.json(pendingStores);
  } catch (error) {
    console.error('Admin store approvals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/store-approvals/:id', protect, isAdmin, async (req, res) => {
  const { action } = req.body; // 'approve' or 'reject'
  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.userType !== 'store') return res.status(400).json({ message: 'User is not a store' });

    if (action === 'approve') {
      user.storeApproved = true;
      user.storeRejected = false;
    } else {
      user.storeApproved = false;
      user.storeRejected = true;
    }
    await user.save();

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: action === 'approve' ? 'Your store has been approved! - PetPair' : 'Store application update - PetPair',
      text: action === 'approve'
        ? `Congratulations! Your store "${user.storeName}" has been approved. You can now list pets and be visible in the Pet Stores section.`
        : `We're sorry, but your store application for "${user.storeName}" was not approved at this time. Please contact support for more information.`
    };
    transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));

    res.json({ message: `Store ${action}d successfully` });
  } catch (error) {
    console.error('Admin store approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/send-notification', protect, isAdmin, async (req, res) => {
  const { subject, message, targetType, selectedUserIds } = req.body; // targetType: 'all', 'individual', 'store'
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required' });
  }

  try {
    let usersToNotify = [];

    // If specific users are selected, use those
    if (selectedUserIds && selectedUserIds.length > 0) {
      usersToNotify = await User.find({ _id: { $in: selectedUserIds } }).select('email name _id');
    } else {
      // Otherwise, filter by targetType
      const userQuery = {};
      if (targetType && targetType !== 'all') {
        userQuery.userType = targetType;
      }
      const users = await User.find(userQuery).select('email name _id');

      // Get preferences for these users
      const userIds = users.map(u => u._id);
      const prefs = await Preferences.find({ userId: { $in: userIds }, emailNotifications: true }).select('userId');
      const enabledUserIds = new Set(prefs.map(p => p.userId.toString()));

      // Filter users who have email notifications enabled (or no preference set, which defaults to true)
      usersToNotify = users.filter(u => enabledUserIds.has(u._id.toString()) || !prefs.find(p => p.userId.toString() === u._id.toString()));
    }

    let sentCount = 0;
    for (const user of usersToNotify) {
      try {
        // Save to database for in-app notifications
        await new Notification({
          userId: user._id,
          title: subject,
          message: message
        }).save();

        // Send email
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: subject,
          text: `Hi ${user.name},\n\n${message}\n\nBest regards,\nThe PetPair Team`
        });
        sentCount++;
      } catch (emailErr) {
        console.error(`Failed to send to ${user.email}:`, emailErr);
      }
    }

    res.json({ message: `Notification sent to ${sentCount} users` });
  } catch (error) {
    console.error('Admin send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- USER NOTIFICATION ENDPOINTS ---

// Get user's notifications
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details (for viewing other users' profiles/stores)
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatar location phone bio userType emailVerified mobileVerified storeApproved storeName storeDescription storeAddress');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats for profile display
app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;

    // Count active pets listed by this user
    const petsListed = await Pet.countDocuments({ ownerId: userId, status: { $ne: 'deleted' } });

    // Count sold pets by this user
    const successfulSales = await Pet.countDocuments({ ownerId: userId, status: 'sold' });

    // Calculate real average rating from reviews
    const reviews = await Review.find({ reviewedUserId: userId });
    const reviewCount = reviews.length;
    let rating = 0;
    if (reviewCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      rating = parseFloat((totalRating / reviewCount).toFixed(1));
    }

    res.json({ petsListed, successfulSales, rating, reviewCount });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- REVIEW ENDPOINTS ---

// Get reviews for a user
app.get('/api/users/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.id })
      .populate('reviewerId', 'name avatar')
      .populate('petId', 'name breed')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review
app.post('/api/users/:id/reviews', protect, async (req, res) => {
  try {
    const reviewedUserId = req.params.id;
    const reviewerId = req.user.userId;
    const { rating, comment, petId } = req.body;

    // Can't review yourself
    if (reviewedUserId === reviewerId) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ reviewerId, reviewedUserId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this user' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = new Review({
      reviewerId,
      reviewedUserId,
      rating,
      comment: comment || '',
      petId: petId || undefined
    });

    await review.save();
    await review.populate('reviewerId', 'name avatar');

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this user' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review (only the reviewer can delete their own review)
app.delete('/api/reviews/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.reviewerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- VET ENDPOINTS ---

// Get all vets (public)
app.get('/api/vets', async (req, res) => {
  try {
    const { specialty, emergencyOnly, search } = req.query;
    let query = {};

    if (specialty && specialty !== 'all') {
      query.specialty = specialty;
    }
    if (emergencyOnly === 'true') {
      query.emergencyService = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const vets = await Vet.find(query).sort({ createdAt: -1 });
    res.json(vets);
  } catch (error) {
    console.error('Error fetching vets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single vet (public)
app.get('/api/vets/:id', async (req, res) => {
  try {
    const vet = await Vet.findById(req.params.id);
    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }
    res.json(vet);
  } catch (error) {
    console.error('Error fetching vet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create vet (admin only)
app.post('/api/admin/vets', protect, async (req, res) => {
  try {
    // Check if admin
    const user = await User.findById(req.user.userId);
    if (!user || (user.email !== 'varunrockes2004@gmail.com' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { name, specialty, location, address, phone, image, emergencyService, availableDays, availableTime } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Vet name is required' });
    }

    const vet = new Vet({
      name,
      specialty: specialty || [],
      location,
      address,
      phone,
      image,
      emergencyService: emergencyService || false,
      availableDays: availableDays || [],
      availableTime: availableTime || ''
    });

    const savedVet = await vet.save();
    res.status(201).json(savedVet);
  } catch (error) {
    console.error('Error creating vet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vet (admin only)
app.put('/api/admin/vets/:id', protect, async (req, res) => {
  try {
    // Check if admin
    const user = await User.findById(req.user.userId);
    if (!user || (user.email !== 'varunrockes2004@gmail.com' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const vet = await Vet.findById(req.params.id);
    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    const { name, specialty, location, address, phone, image, emergencyService, availableDays, availableTime } = req.body;

    if (name !== undefined) vet.name = name;
    if (specialty !== undefined) vet.specialty = specialty;
    if (location !== undefined) vet.location = location;
    if (address !== undefined) vet.address = address;
    if (phone !== undefined) vet.phone = phone;
    if (image !== undefined) vet.image = image;
    if (emergencyService !== undefined) vet.emergencyService = emergencyService;
    if (availableDays !== undefined) vet.availableDays = availableDays;
    if (availableTime !== undefined) vet.availableTime = availableTime;

    const updatedVet = await vet.save();
    res.json(updatedVet);
  } catch (error) {
    console.error('Error updating vet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete vet (admin only)
app.delete('/api/admin/vets/:id', protect, async (req, res) => {
  try {
    // Check if admin
    const user = await User.findById(req.user.userId);
    if (!user || (user.email !== 'varunrockes2004@gmail.com' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const vet = await Vet.findById(req.params.id);
    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    await Vet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vet deleted successfully' });
  } catch (error) {
    console.error('Error deleting vet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });
