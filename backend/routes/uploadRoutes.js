import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'farmearn',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 } // 5MB limit
});

router.post('/', upload.single('image'), (req, res) => {
    try {
        res.json({
            message: 'Image Uploaded successfully',
            imageUrl: req.file.path,
        });
    } catch (error) {
        res.status(500).json({ message: 'Image upload failed' });
    }
});

export default router;
