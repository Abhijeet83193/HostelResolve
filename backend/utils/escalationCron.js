const cron = require('node-cron');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

// We run this cron job every day at 10 AM, or more frequently for testing ('* * * * *' for every minute)
// '0 10 * * *' means "At 10:00 AM every day"
const scheduleTime = process.env.NODE_ENV === 'development' ? '* * * * *' : '0 10 * * *'; // Run every 1 min in dev for testing

const startEscalationCronJob = () => {
    console.log(`⏱️  Escalation Cron Job scheduled: ${scheduleTime}`);
    
    cron.schedule(scheduleTime, async () => {
        console.log('🔍 Running automated complaint escalation check...');
        
        try {
            // Find complaints older than 48 hours (or 5 minutes in dev)
            const timeToEscalateMs = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 48 * 60 * 60 * 1000;
            const escalateTimeThreshold = new Date(Date.now() - timeToEscalateMs);
            const timeDisplayStr = process.env.NODE_ENV === 'development' ? '5 minutes' : '48 hours';

            const pendingComplaintsToEscalate = await Complaint.find({
                status: { $in: ['Pending', 'In Progress'] },
                isEscalated: false,
                createdAt: { $lt: escalateTimeThreshold }
            }).populate('createdBy', 'name email');

            if (pendingComplaintsToEscalate.length === 0) {
                console.log('✅ No complaints need escalation right now.');
                return;
            }

            console.log(`⚠️ Found ${pendingComplaintsToEscalate.length} complaints to escalate!`);

            // Fetch Higher Authority Email from environment variables
            const higherAuthorityEmail = process.env.HIGHER_AUTHORITY_EMAIL;
            
            if (!higherAuthorityEmail) {
                console.log('⚠️ No HIGHER_AUTHORITY_EMAIL configured in .env. Falling back to sending no escalation emails.');
            }

            // Process each complaint
            for (const complaintDoc of pendingComplaintsToEscalate) {
                // 1. Mark as escalated atomically to prevent race conditions if multiple servers are running
                const complaint = await Complaint.findOneAndUpdate(
                    { _id: complaintDoc._id, isEscalated: false },
                    { $set: { isEscalated: true } },
                    { new: true }
                ).populate('createdBy', 'name email');

                // If another server instance already escalated this complaint at the same time, skip.
                if (!complaint) continue;
                
                // 2. Automatically add a system comment
                complaint.comments.push({
                    user: complaint.createdBy._id, // Ideally a system/admin user ID, but falling back to creator for now to bypass ref requirement or add a mock text
                    text: '⚠️ SYSTEM: This complaint has been automatically escalated to higher authorities due to inactivity/delays.',
                    createdAt: Date.now()
                });

                await complaint.save();

                // 3. Email the official higher authority
                if (higherAuthorityEmail) {
                    const message = `
                        Attention Higher Authority,
                        
                        A complaint has been automatically escalated due to not being resolved within ${timeDisplayStr}.
                        
                        Complaint Details:
                        - ID: ${complaint._id}
                        - Title: ${complaint.title}
                        - Category: ${complaint.category}
                        - Hostel/Room: ${complaint.hostel} - ${complaint.room}
                        - Created By: ${complaint.createdBy.name} (${complaint.createdBy.email})
                        - Submitted On: ${new Date(complaint.createdAt).toLocaleString()}
                        
                        Please review and take action promptly via the HostelResolve portal.
                    `;

                    await sendEmail({
                        email: higherAuthorityEmail,
                        subject: `🚨 ESCALATION: Unresolved Complaint - ${complaint.title}`,
                        message,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ff4444; border-radius: 10px;">
                                <h2 style="color: #ff4444;">🚨 Complaint Escalation</h2>
                                <p>A complaint has exceeded the standard resolution time and has been marked as <strong>Escalated</strong>.</p>
                                <ul>
                                    <li><strong>Title:</strong> ${complaint.title}</li>
                                    <li><strong>Category:</strong> ${complaint.category}</li>
                                    <li><strong>Hostel & Room:</strong> ${complaint.hostel} - ${complaint.room}</li>
                                    <li><strong>Priority:</strong> ${complaint.priority}</li>
                                    <li><strong>Student:</strong> ${complaint.createdBy.name}</li>
                                    <li><strong>Submitted at:</strong> ${new Date(complaint.createdAt).toLocaleString()}</li>
                                </ul>
                                <p>Please take immediate action to resolve this issue.</p>
                            </div>
                        `
                    });
                }

                // 4. Notify the student (user who created it)
                await sendEmail({
                    email: complaint.createdBy.email,
                    subject: `Update on your Complaint: ${complaint.title} (Escalated)`,
                    message: 'Your complaint has been escalated.',
                    html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                                <h2>Complaint Escalated</h2>
                                <p>Hello ${complaint.createdBy.name},</p>
                                <p>We noticed your complaint <strong>"${complaint.title}"</strong> has taken longer than usual to resolve.</p>
                                <p>It has now been automatically escalated to the Head Wardens for immediate review.</p>
                                <p>Thank you for your patience.</p>
                            </div>
                    `
                });

                console.log(`✅ successfully escalated complaint: ${complaint._id}`);
            }

        } catch (error) {
            console.error('❌ Error during escalation cron job:', error);
        }
    });
};

module.exports = startEscalationCronJob;
