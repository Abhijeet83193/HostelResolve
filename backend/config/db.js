const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        // Log URI with password masked
        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
        console.log(`Connecting to: ${maskedUri}`);

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Log more details if it's an auth error
        if (error.message.includes('auth')) {
            console.error('Tip: Check if your Database User password in Atlas matches the one in .env');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
