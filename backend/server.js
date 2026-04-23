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

        const PORT = process.env.PORT || 5000;
        
        console.log('Loading routes...');
        app.use('/api/auth', require('./routes/authRoutes'));
        console.log('Auth routes loaded');
        app.use('/api/complaints', require('./routes/complaintRoutes'));
        console.log('Complaint routes loaded');
        app.use('/api/notifications', require('./routes/notificationRoutes'));
        console.log('Notification routes loaded');

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
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();