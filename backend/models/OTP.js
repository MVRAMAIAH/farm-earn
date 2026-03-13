import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiryTime: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
