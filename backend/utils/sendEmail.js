const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `HostelResolve <${process.env.EMAIL_FROM || 'noreply@hostelresolve.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Support for HTML formatting
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
