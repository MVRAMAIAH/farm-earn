import express from 'express';
import { addCrop, getAllCrops, getFarmerCrops, verifyCrop, deleteCrop } from '../controllers/cropController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add-crop', protect, authorizeRoles('Farmer'), addCrop);
router.get('/all-crops', protect, getAllCrops); // Buyers and everyone can see verified crops
router.get('/farmer-crops', protect, authorizeRoles('Farmer'), getFarmerCrops);
router.put('/:id/verify', protect, authorizeRoles('Agent'), verifyCrop);
router.delete('/:id', protect, authorizeRoles('Farmer', 'Admin'), deleteCrop);

export default router;
