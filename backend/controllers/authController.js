import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user (with verification pending)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, aadhar, password, role, location, profileImage } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }, { aadhar }] });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email, phone, or aadhar already exists');
    }

    const user = await User.create({
        name,
        email,
        phone,
        aadhar,
        password,
        role,
        location,
        profileImage,
        isVerified: false
    });

    if (user) {
        // Generating a dummy OTP and saving it
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);

        await OTP.create({
            phone,
            otp: otpCode,
            expiryTime: expiry
        });

        // Normally we would send SMS and Email here
        console.log(`[DUMMY] OTP for ${phone} is ${otpCode}`);

        res.status(201).json({
            message: 'Registration successful. Please verify OTP sent to your phone and email link.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Verify OTP for user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    const otpRecord = await OTP.findOne({ phone }).sort({ createdAt: -1 });

    if (!otpRecord) {
        res.status(400);
        throw new Error('OTP not found for this phone number');
    }

    if (new Date() > otpRecord.expiryTime) {
        res.status(400);
        throw new Error('OTP expired');
    }

    if (otpRecord.otp !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    // OTP is valid
    await OTP.deleteMany({ phone }); // clear all OTPS

    // Find user and mark as verified
    const user = await User.findOne({ phone });
    if (user) {
        user.isVerified = true;
        await user.save();
        res.json({
            message: 'Phone number verified successfully',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            isVerified: user.isVerified
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(401);
            throw new Error('Account not verified. Please verify your phone number.');
        }

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

export { registerUser, verifyOtp, authUser };
