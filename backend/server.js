import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_super_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://myAtlasDBUser:deva@myatlasclusteredu.hjsgp.mongodb.net/PetPair';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, default: '' },
  bio: { type: String, default: 'Edit your bio to share your passion for pets!' },
});

const User = mongoose.model('User', userSchema);

// --- NEW MIDDLEWARE: PROTECTED ROUTE CHECK ---
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attaches userId (decoded.userId) to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
// ---------------------------------------------


/**
 * User Login Endpoint
 * POST /api/login
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create and sign a JWT token with ALL user information
    const token = jwt.sign(
      {
        userId: user._id, email: user.email, name: user.name, location: user.location,
        phone: user.phone, bio: user.bio
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * User Registration Endpoint
 * POST /api/register
 */
app.post('/api/register', async (req, res) => {
  const { name, email, password, location } = req.body;
  // ... (Registration logic remains the same) ...
  if (!name || !email || !password || !location) {
    return res.status(400).json({ general: 'All required fields must be provided.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ general: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name, email, password: hashedPassword, location
    });
    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id, email: newUser.email, name: newUser.name,
        location: newUser.location, phone: newUser.phone, bio: newUser.bio
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ general: 'Server error during registration.' });
  }
});


// --- NEW ENDPOINT: UPDATE USER PROFILE ---
/**
 * Update User Profile Endpoint
 * PUT /api/profile
 */
app.put('/api/profile', protect, async (req, res) => {
  // Fields allowed to be updated (excluding email and password)
  const { name, location, phone, bio } = req.body;
  const userId = req.user.userId; // Extracted from the JWT by the 'protect' middleware

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields only if they are provided in the request body
    user.name = name ?? user.name;
    user.location = location ?? user.location;
    user.phone = phone ?? user.phone;
    user.bio = bio ?? user.bio;

    const updatedUser = await user.save();

    // Re-create a new JWT with the updated user data
    const newToken = jwt.sign(
      {
        userId: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        location: updatedUser.location,
        phone: updatedUser.phone,
        bio: updatedUser.bio
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Profile updated successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});
// --- NEW SCHEMAS ---
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  type: { type: String, required: true },
  price: { type: Number },
  location: { type: String, required: true },
  description: { type: String, required: true },
  vaccinated: { type: Boolean, default: false },
  neutered: { type: Boolean, default: false },
  availableForMating: { type: Boolean, default: false },
  availableForSale: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  imageUrls: [{ type: String }],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

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
const Preferences = mongoose.model('Preferences', preferencesSchema);

// --- PET ENDPOINTS ---
app.post('/api/pets', protect, async (req, res) => {
  try {
    const pet = new Pet({
      ...req.body,
      ownerId: req.user.userId
    });
    const savedPet = await pet.save();
    res.status(201).json(savedPet);
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ message: 'Server error creating pet' });
  }
});

app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.find().sort({ createdAt: -1 }).populate('ownerId', 'name email location phone bio');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pets' });
  }
});

// --- PREFERENCES ENDPOINTS ---
app.get('/api/preferences', protect, async (req, res) => {
  try {
    let prefs = await Preferences.findOne({ userId: req.user.userId });
    if (!prefs) {
      // Create default preferences if not found
      prefs = new Preferences({ userId: req.user.userId });
      await prefs.save();
    }
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching preferences' });
  }
});

app.put('/api/preferences', protect, async (req, res) => {
  try {
    const prefs = await Preferences.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});
// ---------------------------------------------


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});