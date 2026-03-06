import asyncHandler from 'express-async-handler';
import Crop from '../models/Crop.js';

// @desc    Create a new crop listing
// @route   POST /api/crops/add-crop
// @access  Private/Farmer
const addCrop = asyncHandler(async (req, res) => {
    const { cropName, quantity, price, harvestDate, cropImage, description, category, location } = req.body;

    const crop = new Crop({
        cropName,
        farmerId: req.user._id,
        quantity,
        price,
        harvestDate,
        cropImage,
        description,
        category,
        location
    });

    const createdCrop = await crop.save();
    res.status(201).json(createdCrop);
});

// @desc    Get all verified crops for marketplace
// @route   GET /api/crops/all-crops
// @access  Private/Buyer, Admin
const getAllCrops = asyncHandler(async (req, res) => {
    let query = { status: 'Verified' };

    // Agents and Admins can see everything (pending, rejected, etc.)
    if (req.user && (req.user.role === 'Agent' || req.user.role === 'Admin')) {
        query = {};
    }

    const crops = await Crop.find(query).populate('farmerId', 'name phone location profileImage');
    res.json(crops);
});

// @desc    Get logged in farmer's crops
// @route   GET /api/crops/farmer-crops
// @access  Private/Farmer
const getFarmerCrops = asyncHandler(async (req, res) => {
    const crops = await Crop.find({ farmerId: req.user._id });
    res.json(crops);
});

// @desc    Verify a crop
// @route   PUT /api/crops/:id/verify
// @access  Private/Agent
const verifyCrop = asyncHandler(async (req, res) => {
    const { status, report, inspectionImages } = req.body;

    const crop = await Crop.findById(req.params.id);

    if (crop) {
        crop.status = status; // e.g. 'Verified', 'Rejected'
        crop.agentVerification = {
            status: status === 'Verified' ? 'Verified' : 'Rejected',
            report: report || crop.agentVerification.report,
            agentId: req.user._id,
            inspectionImages: inspectionImages || crop.agentVerification.inspectionImages
        };

        const updatedCrop = await crop.save();
        res.json(updatedCrop);
    } else {
        res.status(404);
        throw new Error('Crop not found');
    }
});

// @desc    Delete a crop
// @route   DELETE /api/crops/:id
// @access  Private/Farmer
const deleteCrop = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);

    if (crop) {
        // Ensure only the farmer who created the crop can delete it
        if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            res.status(401);
            throw new Error('User not authorized to delete this crop');
        }
        await crop.deleteOne();
        res.json({ message: 'Crop removed' });
    } else {
        res.status(404);
        throw new Error('Crop not found');
    }
});

export { addCrop, getAllCrops, getFarmerCrops, verifyCrop, deleteCrop };
