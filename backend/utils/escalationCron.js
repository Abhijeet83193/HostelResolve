const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const sendEmail = require('./sendEmail');

const scheduleTime = '*/1 * * * *';

const startEscalationCronJob = () => {
    console.log(`⏱️  Escalation Cron Job scheduled: ${scheduleTime}`);
    
    cron.schedule(scheduleTime, async () => {
        console.log('🔍 Running automated complaint escalation check...');
        
        try {
            const timeToEscalateMs = 5 * 60 * 1000; // 5 minutes for testing
            const escalateTimeThreshold = new Date(Date.now() - timeToEscalateMs);
            const timeDisplayStr = '5 minutes';

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

            const higherAuthorityEmail = process.env.HIGHER_AUTHORITY_EMAIL;
            
            if (!higherAuthorityEmail) {
                console.log('⚠️ No HIGHER_AUTHORITY_EMAIL configured in .env.');
            }

            for (const complaintDoc of pendingComplaintsToEscalate) {
                const complaint = await Complaint.findOneAndUpdate(
                    { _id: complaintDoc._id, isEscalated: false },
                    { $set: { isEscalated: true } },
                    { new: true }
                ).populate('createdBy', 'name email');

                if (!complaint) continue;
                
                complaint.comments.push({
                    user: complaint.createdBy._id,
                    text: '⚠️ SYSTEM: This complaint has been automatically escalated to higher authorities due to inactivity/delays.',
                    createdAt: Date.now()
                });

                await complaint.save();

                if (higherAuthorityEmail) {
                    const message = `
A complaint has been automatically escalated due to not being resolved within ${timeDisplayStr}.
Title: ${complaint.title}
Category: ${complaint.category}
Hostel/Room: ${complaint.hostel} - ${complaint.room}
                    `;

                    await sendEmail({
                        email: higherAuthorityEmail,
                        subject: `🚨 ESCALATION: ${complaint.title}`,
                        message,
                    });
                }

                await sendEmail({
                    email: complaint.createdBy.email,
                    subject: `Update: ${complaint.title}`,
                    message: 'Your complaint has been escalated.',
                });

                console.log(`✅ Escalated complaint: ${complaint._id}`);
            }

        } catch (error) {
            console.error('❌ Error during escalation cron job:', error);
        }
    });
};

module.exports = startEscalationCronJob;