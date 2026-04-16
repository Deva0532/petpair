import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import XLSX from 'xlsx';
import multer from 'multer';

// Configure multer for file uploads (memory storage for Excel processing)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
  // User category: normal (max 2 pets) or kennel (unlimited, premium)
  userType: { type: String, enum: ['individual', 'store', 'normal', 'kennel'], default: 'normal' },
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
    console.error("JWT Verification ERROR:", error.message);
    console.log("Received Token (first 50 chars):", token?.substring(0, 50));
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin Middleware - checks if user is admin
// Admin Middleware - checks if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
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
    role: user.role
  }, JWT_SECRET, { expiresIn: '7d' });
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
    // Check if this is the admin email
    const ADMIN_EMAIL = 'varunrockes2004@gmail.com';
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
    } else {
      // Update existing user
      if (!user.googleId) user.googleId = googleId;
      user.avatar = user.avatar || picture;

      // Auto-migrate admin role if email matches
      if (isAdminEmail) {
        user.role = 'admin';
        user.isNewUser = false;
      }

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
      subject: 'Verify your email for Peto',
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
      subject: 'Your Password Reset OTP - Peto',
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
  website: { type: String },
  directionsUrl: { type: String },
  emergencyService: { type: Boolean, default: false },
  availableDays: [{ type: String }], // e.g., ['Monday', 'Tuesday', 'Wednesday']
  availableTime: { type: String }, // e.g., '9:00 AM - 6:00 PM'
  yearsInBusiness: { type: String },
  onSiteServices: { type: Boolean, default: false },
  review: { type: String },
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
// Auto-delete notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days = 2592000 seconds

// --- REVIEW SCHEMA ---
const reviewSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reported: { type: Boolean, default: false },
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportReasons: [{ type: String }],
  reportCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
reviewSchema.index({ petId: 1, createdAt: -1 });
reviewSchema.index({ petId: 1, userId: 1 }, { unique: true }); // One review per user per pet

const Pet = mongoose.model('Pet', petSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const Preferences = mongoose.model('Preferences', preferencesSchema);
const Review = mongoose.model('Review', reviewSchema);
const Vet = mongoose.model('Vet', vetSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// --- PET ENDPOINTS ---

// Get current user's pet count
app.get('/api/pets/my-count', protect, async (req, res) => {
  try {
    const count = await Pet.countDocuments({ ownerId: req.user.userId, status: { $ne: 'deleted' } });
    const user = await User.findById(req.user.userId).select('userType');
    const userType = (user?.userType === 'kennel') ? 'kennel' : 'normal';
    const maxPets = userType === 'kennel' ? Infinity : 2;
    res.json({ count, maxPets, userType, canPost: userType === 'kennel' || count < 2 });
  } catch (error) {
    console.error('Error fetching pet count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download Excel template for bulk pet upload (MUST be before /:id route)
app.get('/api/pets/bulk-template', protect, async (req, res) => {
  try {
    const headers = [
      'name', 'type', 'breed', 'age', 'gender', 'price', 'location',
      'description', 'weight', 'size', 'activityLevel',
      'vaccinated', 'neutered', 'availableForSale', 'availableForMating',
      'goodWithKids', 'goodWithPets', 'houseTrained', 'specialNeeds',
      'medicalNotes'
    ];

    const sampleData = [
      {
        name: 'Buddy', type: 'dog', breed: 'Golden Retriever', age: 2, gender: 'male',
        price: 15000, location: 'Mumbai', description: 'Friendly and playful golden retriever',
        weight: 30, size: 'large', activityLevel: 'high',
        vaccinated: 'yes', neutered: 'no', availableForSale: 'yes', availableForMating: 'no',
        goodWithKids: 'yes', goodWithPets: 'yes', houseTrained: 'yes', specialNeeds: 'no',
        medicalNotes: 'All vaccinations up to date'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 15) }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pets');

    const instructions = [
      { Field: 'name', Description: 'Pet name (required)', 'Allowed Values': 'Any text' },
      { Field: 'type', Description: 'Type of pet (required)', 'Allowed Values': 'dog, cat, bird, fish, reptile, other' },
      { Field: 'breed', Description: 'Breed of pet (required)', 'Allowed Values': 'Any text' },
      { Field: 'age', Description: 'Age in years (required)', 'Allowed Values': 'Number (e.g., 2, 0.5)' },
      { Field: 'gender', Description: 'Gender', 'Allowed Values': 'male, female' },
      { Field: 'price', Description: 'Price in INR', 'Allowed Values': 'Number (e.g., 15000)' },
      { Field: 'location', Description: 'Location (required)', 'Allowed Values': 'City, State' },
      { Field: 'description', Description: 'Description (required)', 'Allowed Values': 'Any text' },
      { Field: 'weight', Description: 'Weight in kg', 'Allowed Values': 'Number' },
      { Field: 'size', Description: 'Size category', 'Allowed Values': 'small, medium, large, extra-large' },
      { Field: 'activityLevel', Description: 'Activity level', 'Allowed Values': 'low, moderate, high' },
      { Field: 'vaccinated', Description: 'Is vaccinated?', 'Allowed Values': 'yes, no' },
      { Field: 'neutered', Description: 'Is neutered/spayed?', 'Allowed Values': 'yes, no' },
      { Field: 'availableForSale', Description: 'Available for sale?', 'Allowed Values': 'yes, no' },
      { Field: 'availableForMating', Description: 'Available for mating?', 'Allowed Values': 'yes, no' },
      { Field: 'goodWithKids', Description: 'Good with kids?', 'Allowed Values': 'yes, no' },
      { Field: 'goodWithPets', Description: 'Good with other pets?', 'Allowed Values': 'yes, no' },
      { Field: 'houseTrained', Description: 'Is house trained?', 'Allowed Values': 'yes, no' },
      { Field: 'specialNeeds', Description: 'Has special needs?', 'Allowed Values': 'yes, no' },
      { Field: 'medicalNotes', Description: 'Medical notes', 'Allowed Values': 'Any text' },
    ];
    const instrSheet = XLSX.utils.json_to_sheet(instructions);
    instrSheet['!cols'] = [{ wch: 18 }, { wch: 30 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, instrSheet, 'Instructions');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=peto_pet_upload_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Server error generating template' });
  }
});

// Bulk upload pets from Excel (kennel users only, MUST be before /:id route)
app.post('/api/pets/bulk-upload', protect, upload.single('file'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('userType');
    if (user?.userType !== 'kennel') {
      return res.status(403).json({ message: 'Bulk upload is only available for Kennel users.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }
    if (rows.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 pets per bulk upload' });
    }

    const yesToBool = (val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val.toLowerCase().trim() === 'yes' || val.toLowerCase().trim() === 'true';
      return false;
    };

    const results = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.name || !row.type || !row.breed || !row.age || !row.location || !row.description) {
          results.errors.push({ row: i + 2, error: 'Missing required fields (name, type, breed, age, location, description)' });
          results.failed++;
          continue;
        }

        const pet = new Pet({
          name: String(row.name).trim(),
          type: String(row.type).toLowerCase().trim(),
          breed: String(row.breed).trim(),
          age: parseFloat(row.age) || 0,
          gender: row.gender ? String(row.gender).toLowerCase().trim() : 'male',
          price: parseFloat(row.price) || 0,
          location: String(row.location).trim(),
          description: String(row.description).trim(),
          weight: row.weight ? parseFloat(row.weight) : undefined,
          size: row.size ? String(row.size).toLowerCase().trim() : 'medium',
          activityLevel: row.activityLevel ? String(row.activityLevel).toLowerCase().trim() : 'moderate',
          vaccinated: yesToBool(row.vaccinated),
          neutered: yesToBool(row.neutered),
          availableForSale: row.availableForSale !== undefined ? yesToBool(row.availableForSale) : true,
          availableForMating: yesToBool(row.availableForMating),
          goodWithKids: yesToBool(row.goodWithKids),
          goodWithPets: yesToBool(row.goodWithPets),
          houseTrained: yesToBool(row.houseTrained),
          specialNeeds: yesToBool(row.specialNeeds),
          medicalNotes: row.medicalNotes ? String(row.medicalNotes).trim() : '',
          imageUrls: [],
          ownerId: req.user.userId,
          status: 'active'
        });

        await pet.save();
        results.success++;
      } catch (err) {
        results.errors.push({ row: i + 2, error: err.message });
        results.failed++;
      }
    }

    res.status(201).json({
      message: `Bulk upload complete: ${results.success} pets created, ${results.failed} failed.`,
      ...results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Server error during bulk upload' });
  }
});

app.post('/api/pets', protect, async (req, res) => {
  try {
    // Enforce pet limit for normal users
    const user = await User.findById(req.user.userId).select('userType');
    const userType = user?.userType;
    if (userType !== 'kennel') {
      const activePetCount = await Pet.countDocuments({ ownerId: req.user.userId, status: { $ne: 'deleted' } });
      if (activePetCount >= 2) {
        return res.status(403).json({ message: 'Normal users can post a maximum of 2 pets. Upgrade to Kennel for unlimited listings.' });
      }
    }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'recent';

    // Build query with filters
    const query = { status: { $ne: 'deleted' } };

    // Apply filters from query parameters
    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }
    if (req.query.breed) {
      query.breed = req.query.breed;
    }
    if (req.query.gender && req.query.gender !== 'any') {
      query.gender = req.query.gender;
    }
    if (req.query.size && req.query.size !== 'any') {
      query.size = req.query.size;
    }
    if (req.query.activityLevel && req.query.activityLevel !== 'any') {
      query.activityLevel = req.query.activityLevel;
    }
    if (req.query.minAge || req.query.maxAge) {
      query.age = {};
      if (req.query.minAge) query.age.$gte = parseInt(req.query.minAge);
      if (req.query.maxAge) query.age.$lte = parseInt(req.query.maxAge);
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseInt(req.query.maxPrice);
    }
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.vaccinated !== undefined) {
      query.vaccinated = req.query.vaccinated === 'true';
    }
    if (req.query.availableForMating !== undefined) {
      query.availableForMating = req.query.availableForMating === 'true';
    }
    if (req.query.goodWithKids !== undefined) {
      query.goodWithKids = req.query.goodWithKids === 'true';
    }
    if (req.query.goodWithPets !== undefined) {
      query.goodWithPets = req.query.goodWithPets === 'true';
    }
    if (req.query.houseTrained !== undefined) {
      query.houseTrained = req.query.houseTrained === 'true';
    }
    if (req.query.spayedNeutered !== undefined) {
      query.spayedNeutered = req.query.spayedNeutered === 'true';
    }
    if (req.query.specialNeeds !== undefined) {
      query.specialNeeds = req.query.specialNeeds === 'true';
    }
    // Tab-specific filtering
    if (req.query.tab === 'dating') {
      query.availableForMating = true;
    }

    // Determine sort order based on sortBy parameter
    let sortOptions = {};
    switch (sortBy) {
      case 'featured':
        sortOptions = { featured: -1, createdAt: -1 };
        break;
      case 'price-low':
        sortOptions = { price: 1, createdAt: -1 };
        break;
      case 'price-high':
        sortOptions = { price: -1, createdAt: -1 };
        break;
      case 'age':
        sortOptions = { age: 1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const [pets, total] = await Promise.all([
      Pet.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('ownerId', 'name email location phone bio avatar emailVerified mobileVerified userType createdAt'),
      Pet.countDocuments(query)
    ]);

    res.json({
      pets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPets: total,
        petsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pets' });
  }
});

app.get('/api/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('ownerId', 'name email location phone bio avatar emailVerified mobileVerified userType createdAt');
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
      .populate({ path: 'petId', populate: { path: 'ownerId', select: 'name email location phone bio avatar userType storeName emailVerified mobileVerified' } })
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
  if (!userType || !['individual', 'store', 'normal', 'kennel'].includes(userType)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Map old values to new ones
    const mappedType = (userType === 'individual') ? 'normal' : (userType === 'store') ? 'kennel' : userType;
    user.userType = mappedType;
    user.isNewUser = false;

    if (mappedType === 'kennel' || userType === 'store') {
      user.storeName = storeName || '';
      user.storeDescription = storeDescription || '';
      user.storeAddress = storeAddress || user.location;
      user.storeApproved = mappedType === 'kennel' ? true : false;
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
        subject: 'Verify your email - Peto',
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

// --- REVIEW ENDPOINTS ---

// Get reviews for a pet
app.get('/api/pets/:petId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ petId: req.params.petId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// Create a review
app.post('/api/pets/:petId/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const petId = req.params.petId;
    const userId = req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if pet exists
    const pet = await Pet.findById(petId).populate('ownerId');
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if user is the pet owner
    if (pet.ownerId._id.toString() === userId) {
      return res.status(403).json({ message: 'You cannot review your own pet' });
    }

    // Check if user already reviewed this pet
    const existingReview = await Review.findOne({ petId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this pet' });
    }

    // Create review
    const review = await Review.create({
      petId,
      userId,
      rating,
      comment
    });

    const populatedReview = await Review.findById(review._id).populate('userId', 'name avatar');

    // Notify pet owner about new review
    await new Notification({
      userId: pet.ownerId._id,
      title: 'New Review on Your Pet',
      message: `${populatedReview.userId.name} left a ${rating}-star review on ${pet.name}`,
      read: false
    }).save();

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
});

// Update own review
app.put('/api/pets/:petId/reviews/:reviewId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    const updatedReview = await Review.findById(review._id).populate('userId', 'name avatar');
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error updating review' });
  }
});

// Delete own review
app.delete('/api/pets/:petId/reviews/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error deleting review' });
  }
});

// Report a review
app.post('/api/reviews/:reviewId/report', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.reviewId).populate('petId', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already reported this review
    if (review.reportedBy.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You have already reported this review' });
    }

    // Add user to reportedBy array and increment count
    review.reportedBy.push(req.user.userId);
    review.reportCount += 1;
    review.reported = true;
    if (reason) {
      review.reportReasons.push(reason);
    }
    await review.save();

    // Send notification to all admins
    const admins = await User.find({ role: 'admin' });
    const reportMessage = reason
      ? `A review on "${review.petId.name}" has been reported for: ${reason}`
      : `A review on "${review.petId.name}" has been reported and needs moderation`;

    for (const admin of admins) {
      await new Notification({
        userId: admin._id,
        title: 'Review Reported',
        message: reportMessage,
        read: false
      }).save();
    }

    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({ message: 'Server error reporting review' });
  }
});

// Get user's aggregate pet rating
app.get('/api/users/:userId/rating', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get all pets owned by this user
    const userPets = await Pet.find({ ownerId: userId });
    const petIds = userPets.map(pet => pet._id);

    // Get all reviews for these pets
    const reviews = await Review.find({ petId: { $in: petIds } });

    if (reviews.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    res.json({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ message: 'Server error fetching user rating' });
  }
});

// Admin: Get reported reviews
app.get('/api/admin/reported-reviews', protect, isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find({ reported: true })
      .populate('userId', 'name email avatar')
      .populate('petId', 'name imageUrls')
      .sort({ reportCount: -1, createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reported reviews:', error);
    res.status(500).json({ message: 'Server error fetching reported reviews' });
  }
});

// Admin: Delete review
app.delete('/api/admin/reviews/:reviewId', protect, isAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId).populate('petId', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Notify the review author
    await new Notification({
      userId: review.userId,
      title: 'Review Removed',
      message: `Your review on "${review.petId.name}" was removed by admin for violating community guidelines`,
      read: false
    }).save();

    // Notify all users who reported this review
    for (const reporterId of review.reportedBy) {
      await new Notification({
        userId: reporterId,
        title: 'Report Action Taken',
        message: `The review you reported on "${review.petId.name}" has been removed by admin. Thank you for helping keep our community safe.`,
        read: false
      }).save();
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error deleting review' });
  }
});

// Admin: Dismiss report (mark as false report)
app.post('/api/admin/reviews/:reviewId/dismiss', protect, isAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId).populate('petId', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Notify all users who reported this review
    for (const reporterId of review.reportedBy) {
      await new Notification({
        userId: reporterId,
        title: 'Report Reviewed',
        message: `The review you reported on "${review.petId.name}" was reviewed by admin and found to be acceptable. Thank you for your vigilance.`,
        read: false
      }).save();
    }

    // Clear the report flags
    review.reported = false;
    review.reportedBy = [];
    review.reportReasons = [];
    review.reportCount = 0;
    await review.save();

    res.json({ message: 'Report dismissed successfully' });
  } catch (error) {
    console.error('Error dismissing report:', error);
    res.status(500).json({ message: 'Server error dismissing report' });
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

    // Send notification email and create in-app notification before deleting
    if (reason) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Account Removal Notice - Peto',
        text: `Dear ${user.name},\n\nWe regret to inform you that your account on Peto has been removed by our admin team.\n\nReason: ${reason}\n\nIf you believe this was a mistake or have any questions, please contact our support team.\n\nBest regards,\nThe Peto Team`
      };
      transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));

      // Create in-app notification before deleting user
      // Note: User won't be able to see this since account is being deleted,
      // but we create it for consistency and potential audit trail
      try {
        await new Notification({
          userId: userId,
          title: 'Account Removal Notice',
          message: `Your account has been removed by admin. Reason: ${reason}`,
          read: false
        }).save();
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    // Cascading delete
    await Preferences.deleteOne({ userId });
    await Wishlist.deleteMany({ userId });
    await VerificationCode.deleteMany({ email: user.email });
    await Pet.deleteMany({ ownerId: userId });
    await Notification.deleteMany({ userId }); // Also delete notifications
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
        subject: 'Pet Listing Removed - Peto',
        text: `Dear ${pet.ownerId.name},\n\nWe regret to inform you that your pet listing "${pet.name}" (${pet.breed}) has been removed from Peto by our admin team.\n\nReason: ${reason}\n\nIf you believe this was a mistake or have any questions, please contact our support team.\n\nBest regards,\nThe Peto Team`
      };
      transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));

      // Create in-app notification
      try {
        await new Notification({
          userId: pet.ownerId._id,
          title: 'Pet Listing Removed',
          message: `Your pet listing "${pet.name}" (${pet.breed}) has been removed. Reason: ${reason}`,
          read: false
        }).save();
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
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
      subject: action === 'approve' ? 'Your store has been approved! - Peto' : 'Store application update - Peto',
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
          text: `Hi ${user.name},\n\n${message}\n\nBest regards,\nThe Peto Team`
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

    // Get all pets owned by this user
    const userPets = await Pet.find({ ownerId: userId });
    const petIds = userPets.map(pet => pet._id);

    // Get all reviews for these pets
    const reviews = await Review.find({ petId: { $in: petIds } });
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

// --- MIGRATION ENDPOINT: Migrate all existing users to 'normal' ---
app.post('/api/admin/migrate-users-to-normal', protect, isAdmin, async (req, res) => {
  try {
    const result = await User.updateMany(
      { userType: { $in: ['individual', null, undefined] } },
      { $set: { userType: 'normal' } }
    );
    res.json({ message: `Migration complete. ${result.modifiedCount} users updated to normal.` });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Server error during migration' });
  }
});

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });

