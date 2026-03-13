import asyncHandler from 'express-async-handler';
import Crop from '../models/Crop.js';

// @desc    Create a new crop listing
// @route   POST /api/crops/add-crop
// @access  Private/Farmer
const addCrop = asyncHandler(async (req, res) => {
    const { cropName, quantity, price, harvestDate, cropImage, description, category, latitude, longitude, address } = req.body;

    // Parse coordinates safely — default to [0,0] if not provided
    const lat = latitude ? parseFloat(latitude) : 0;
    const lng = longitude ? parseFloat(longitude) : 0;
    const validCoords = !isNaN(lat) && !isNaN(lng) ? [lng, lat] : [0, 0];

    const crop = new Crop({
        cropName,
        farmerId: req.user._id,
        quantity,
        price,
        harvestDate,
        cropImage: cropImage || '',
        description,
        category,
        location: {
            type: 'Point',
            coordinates: validCoords,
            address: address || ''
        }
    });

    const createdCrop = await crop.save();
    res.status(201).json(createdCrop);
});

// @desc    Get all crops (role-based)
// @route   GET /api/crops/all-crops
// @access  Private
const getAllCrops = asyncHandler(async (req, res) => {
    let query = {};
    const { latitude, longitude, radius = 5 } = req.query;

    if (req.user.role === 'Buyer') {
        query = { status: 'Verified' };
    } else if (req.user.role === 'Agent') {
        // Agents see all crops (pending + verified) for their area
        // If coordinates provided and valid, filter by proximity
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (latitude && longitude && !isNaN(lat) && !isNaN(lng) &&
            !(lat === 0 && lng === 0)) {
            query = {
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        $maxDistance: radius * 1000
                    }
                }
            };
        }
        // If no valid coordinates, return all crops (no proximity filter)
    } else if (req.user.role === 'Admin') {
        query = {}; // Admin sees all
    }
    // Farmers use /farmer-crops endpoint

    const crops = await Crop.find(query).populate('farmerId', 'name email location profileImage phone');
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
        crop.status = status;
        crop.agentVerification = {
            status: status === 'Verified' ? 'Verified' : 'Rejected',
            report: report || crop.agentVerification?.report || '',
            agentId: req.user._id,
            inspectionImages: inspectionImages || crop.agentVerification?.inspectionImages || []
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
// @access  Private/Farmer or Admin
const deleteCrop = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);

    if (crop) {
        if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            res.status(401);
            throw new Error('Not authorized to delete this crop');
        }
        await crop.deleteOne();
        res.json({ message: 'Crop removed' });
    } else {
        res.status(404);
        throw new Error('Crop not found');
    }
});

export { addCrop, getAllCrops, getFarmerCrops, verifyCrop, deleteCrop };
