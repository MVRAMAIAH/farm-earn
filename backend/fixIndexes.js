import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const fixIndexes = async () => {
    await connectDB();
    try {
        console.log('Fetching indexes for users collection...');
        const indexes = await User.collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Drop unique indexes on phone and aadhar if they exist
        const phoneIndex = indexes.find(idx => idx.name === 'phone_1');
        if (phoneIndex && phoneIndex.unique) {
            console.log('Dropping unique index on phone...');
            await User.collection.dropIndex('phone_1');
            console.log('Dropped phone_1');
        }

        const aadharIndex = indexes.find(idx => idx.name === 'aadhar_1');
        if (aadharIndex && aadharIndex.unique) {
            console.log('Dropping unique index on aadhar...');
            await User.collection.dropIndex('aadhar_1');
            console.log('Dropped aadhar_1');
        }

        console.log('Indexes fixed! The system will now allow multiple users with null/empty phone/aadhar fields.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
