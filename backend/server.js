// Server initialization
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

const app = express();

        // Middleware
        const corsOptions = {
            origin: ['https://hostelresolve-frontend.onrender.com'],
            credentials: true,
        };
        app.use(cors(corsOptions));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Routes
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/complaints', require('./routes/complaintRoutes'));
        app.use('/api/notifications', require('./routes/notificationRoutes'));

        // Test route
        app.get('/api', (req, res) => {
            res.json({
                message: 'HostelResolve API is running 🚀',
                version: '1.0.0',
            });
        });

        const PORT = process.env.PORT || 5000;
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
};

startServer();
