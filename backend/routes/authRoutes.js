import express from 'express';
import { registerUser, authUser, adminLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/admin-login', adminLogin);

export default router;
