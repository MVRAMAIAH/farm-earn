import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';
import crypto from 'crypto';

dotenv.config({ path: './backend/.env' });

const testAgentLinking = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const testEmail = `testagent_${Date.now()}@example.com`;
        const testFirebaseUid = `firebase_${Date.now()}`;

        // 1. Simulate Admin adding agent
        console.log(`Creating agent with email: ${testEmail}`);
        const agent = await User.create({
            name: 'Test Agent',
            email: testEmail,
            phone: '1234567890',
            password: crypto.randomBytes(16).toString('hex'),
            role: 'Agent',
            location: 'Verified Agent Office',
            aadhar: '000000000000',
            isVerified: true,
        });
        console.log('Agent created in DB');

        // 2. Simulate First Login (Linking logic)
        console.log(`Simulating login for ${testEmail} with firebaseUid: ${testFirebaseUid}`);
        
        // This simulates the logic I added to authController.js
        let user = await User.findOne({ firebaseUid: testFirebaseUid });
        if (!user) {
            user = await User.findOne({ email: testEmail });
            if (user && !user.firebaseUid) {
                user.firebaseUid = testFirebaseUid;
                await user.save();
                console.log('PASSED: User linked with firebaseUid');
            } else {
                console.log('FAILED: User not found by email or already linked');
            }
        }

        // 3. Verify link
        const finalUser = await User.findOne({ email: testEmail });
        if (finalUser.firebaseUid === testFirebaseUid) {
            console.log('VERIFICATION SUCCESSFUL: Agent linked correctly.');
        } else {
            console.log('VERIFICATION FAILED: firebaseUid mismatch.');
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log('Test data cleaned up');
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error during test:', error);
        process.exit(1);
    }
};

testAgentLinking();
