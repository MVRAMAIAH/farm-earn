import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const ADMIN_ID = 'admin-001';
const ADMIN_EMAIL = 'sattenapallibhanuprakash84@gmail.com';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Handle hardcoded admin user (not in DB)
            if (decoded.id === ADMIN_ID) {
                req.user = {
                    _id: ADMIN_ID,
                    name: 'Admin',
                    email: ADMIN_EMAIL,
                    role: 'Admin',
                    isVerified: true
                };
                return next();
            }

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Access denied. Required role: ${roles.join(' or ')}`);
        }
        next();
    };
};

export { protect, authorizeRoles };
