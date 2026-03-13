import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Hard-coded admin credentials
const ADMIN_EMAIL = 'sattenapallibhanuprakash84@gmail.com';
const ADMIN_PASSWORD = 'Bhanu@7386730499';

// @desc    Register a new user (no OTP, instant verification)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, location, profileImage } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Create user directly as verified — no OTP required
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'Farmer',
        location,
        profileImage,
        isVerified: true
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token (Farmer / Buyer / Agent)
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Admin login with hardcoded credentials
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Return a static admin user object with a token
        res.json({
            _id: 'admin-001',
            name: 'Admin',
            email: ADMIN_EMAIL,
            role: 'Admin',
            token: generateToken('admin-001'),
        });
    } else {
        res.status(401);
        throw new Error('Invalid admin credentials');
    }
});

export { registerUser, authUser, adminLogin };
