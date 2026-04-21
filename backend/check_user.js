
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'abhijeetdhokne95@gmail.com' });
        if (user) {
            console.log('USER_FOUND: ' + JSON.stringify(user));
        } else {
            console.log('USER_NOT_FOUND');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR: ' + err.message);
        process.exit(1);
    }
};

checkUser();
