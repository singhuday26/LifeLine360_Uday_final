# 🚨 LifeLine360 Email Setup Guide

## Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the steps to enable 2FA

### Step 2: Generate App Password
1. After enabling 2FA, go back to "Security" → "Signing in to Google"
2. Click on "App passwords" (you might need to sign in again)
3. Select "Mail" and "Windows Computer" (or any device)
4. Click "Generate"
5. Copy the 16-character password (ignore spaces)

### Step 3: Update .env File
Replace `YOUR_APP_PASSWORD_HERE` in your `.env` file with the App Password you just generated.

### Step 4: Test Email
Run the test script:
```bash
node test-email.js
```

## 📧 Email Configuration Summary

**What you need to fill in `.env`:**

```env
EMAIL_USER=your-gmail@gmail.com          # Your Gmail address
EMAIL_PASS=YOUR_APP_PASSWORD_HERE        # 16-char App Password (no spaces)
EMAIL_FROM=LifeLine360 Alerts <your-gmail@gmail.com>
ALERT_RECIPIENTS=your-email@gmail.com,admin@company.com,emergency@company.com
```

## 🧪 Testing Commands

```bash
# Test email configuration
node test-email.js

# Start the server
npm run server

# Test alert API (in another terminal)
curl -X POST http://localhost:3001/api/test-alert-email

# Check alerts
curl http://localhost:3001/api/alerts
```

## ✅ Success Indicators

When email works, you'll see:
- ✅ Test email sent successfully!
- Message ID: [some-id]
- Check your inbox for the test email

## 🔧 Troubleshooting

**"Invalid login" error:**
- Make sure you're using the App Password, not your regular Gmail password
- Check that 2FA is enabled
- Regenerate the App Password if needed

**"Connection refused" error:**
- Check your internet connection
- Verify firewall isn't blocking port 587

**Still having issues?**
- Try using a different email provider (Outlook, Yahoo, etc.)
- Or use a service like SendGrid, Mailgun for production

---

**Once email is working, your LifeLine360 alert system will automatically send emails when disasters are detected!** 🚨