const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const c = await Complaint.find().sort({createdAt: -1});
    fs.writeFileSync('output.json', JSON.stringify(c, null, 2));
    process.exit(0);
});
