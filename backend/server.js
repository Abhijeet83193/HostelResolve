const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const startServer = async () => {
    try {
        await connectDB();
        
        // Start escalation cron job
        const startEscalationCronJob = require('./utils/escalationCron');
        startEscalationCronJob();

        const app = express();

        const corsOptions = {
            origin: ['https://hostelresolve-frontend.onrender.com', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
            credentials: true,
        };
        app.use(cors(corsOptions));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // DIRECT TEST ROUTE - bypass routes folder completely
        app.post('/api/auth/login-direct', (req, res) => {
            console.log('Direct login route hit!');
            res.json({ success: true, message: 'Direct route works' });
        });

        console.log('Loading routes...');
        const authRoutes = require('./routes/authRoutes');
        console.log('Auth routes module loaded:', !!authRoutes);
        app.use('/api/auth', authRoutes);
        console.log('Auth routes mounted');

        const complaintRoutes = require('./routes/complaintRoutes');
        console.log('Complaint routes module loaded:', !!complaintRoutes);
        app.use('/api/complaints', complaintRoutes);
        console.log('Complaint routes mounted');

        app.use('/api/announcements', require('./routes/announcementRoutes'));
        console.log('Announcement routes mounted');

        const notificationRoutes = require('./routes/notificationRoutes');
        console.log('Notification routes module loaded:', !!notificationRoutes);
        app.use('/api/notifications', notificationRoutes);
        console.log('Notification routes mounted');

        // Test route to verify mounting works
        app.get('/api/test', (req, res) => {
            console.log('Test route hit');
            res.json({ message: 'Test route works' });
        });

        app.get('/api', (req, res) => {
            console.log('API root hit');
            res.json({
                message: 'HostelResolve API is running 🚀',
                version: '1.0.0',
            });
        });

        const PORT = process.env.PORT || 5000;
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();