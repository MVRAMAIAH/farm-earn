import express from 'express';
import { registerUser, verifyOtp, authUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/verify-otp', verifyOtp);

export default router;
