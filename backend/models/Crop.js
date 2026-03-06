import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
    {
        cropName: {
            type: String,
            required: [true, 'Please add a crop name'],
            trim: true,
        },
        farmerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Please add a quantity'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
        },
        harvestDate: {
            type: Date,
            required: [true, 'Please add a harvest date'],
        },
        cropImage: {
            type: String,
            required: [true, 'Please add a crop image'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        category: {
            type: String,
            enum: ['Available Crops', 'Useful Crops', 'Crops Going To Sell'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending verification', 'Verified', 'Rejected', 'Sold'],
            default: 'Pending verification',
        },
        agentVerification: {
            status: {
                type: String,
                enum: ['Pending', 'Verified', 'Rejected'],
                default: 'Pending',
            },
            report: {
                type: String,
                default: '',
            },
            agentId: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            inspectionImages: {
                type: [String],
                default: [],
            },
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
        },
    },
    {
        timestamps: true,
    }
);

const Crop = mongoose.model('Crop', cropSchema);

export default Crop;
