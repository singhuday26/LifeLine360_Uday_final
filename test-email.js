const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'LifeLine360 Alerts <your-email@gmail.com>';
const ALERT_RECIPIENTS = (process.env.ALERT_RECIPIENTS || 'admin@lifeline360.com').split(',').map(email => email.trim());

// Test email function
async function sendTestEmail() {
    try {
        console.log('Testing email configuration...');
        console.log('From:', EMAIL_FROM);
        console.log('To:', ALERT_RECIPIENTS);
        console.log('SMTP Host:', process.env.EMAIL_HOST);
        console.log('SMTP Port:', process.env.EMAIL_PORT);

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">✅ LifeLine360 Email Test</h2>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #28a745; margin-top: 0;">Test Email Successful!</h3>
                    <p><strong>Status:</strong> Email configuration is working correctly</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Recipients:</strong> ${ALERT_RECIPIENTS.join(', ')}</p>
                </div>
                <p style="color: #6c757d; font-size: 12px;">
                    This is a test email from LifeLine360 Disaster Management System.
                </p>
            </div>
        `;

        const mailOptions = {
            from: EMAIL_FROM,
            to: ALERT_RECIPIENTS.join(','),
            subject: `✅ LifeLine360 Email Test - ${new Date().toLocaleString()}`,
            html: emailHtml
        };

        console.log('Sending test email...');
        const info = await emailTransporter.sendMail(mailOptions);

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Recipients:', ALERT_RECIPIENTS.length);
        console.log('Check your inbox for the test email.');

    } catch (error) {
        console.error('❌ Failed to send test email:');
        console.error('Error:', error.message);

        if (error.code === 'EAUTH') {
            console.log('\n🔧 Possible solutions:');
            console.log('1. Check if EMAIL_USER and EMAIL_PASS are correct');
            console.log('2. For Gmail: Make sure you\'re using an App Password, not your regular password');
            console.log('3. Enable 2-factor authentication on your Gmail account');
            console.log('4. Generate an App Password: https://support.google.com/accounts/answer/185833');
        }

        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Possible solutions:');
            console.log('1. Check your internet connection');
            console.log('2. Verify EMAIL_HOST and EMAIL_PORT are correct');
            console.log('3. Check if your firewall is blocking SMTP connections');
        }
    }
}

// Run the test
sendTestEmail();