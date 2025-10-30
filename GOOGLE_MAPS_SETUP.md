# 🚨 Google Maps API Setup Guide

## Problem: "Oops! Something went wrong. This page didn't load Google Maps correctly."

This error occurs because your LifeLine360 dashboard needs a Google Maps API key to display the real-time incident map.

## 🗺️ Solution 1: Get a Google Maps API Key (Recommended)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)

### Step 2: Enable Maps JavaScript API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Maps JavaScript API"
3. Click "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

### Step 4: Restrict API Key (Security)

1. Click on your API key in the credentials list
2. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `localhost:5173/*` (for development)
   - Add: `yourdomain.com/*` (for production)
3. Under "API restrictions":
   - Select "Restrict key"
   - Check "Maps JavaScript API"

### Step 5: Add to Environment

Update your `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Step 6: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🛠️ Solution 2: Development Fallback (No API Key Required)

For development/testing, you can use a simple map placeholder:

### Option A: Static Map Image

Replace the Google Maps component with a static map image.

### Option B: Simple Coordinate Display

Show incident coordinates in a text-based format.

Would you like me to implement a fallback solution that doesn't require an API key?

## 🔧 Troubleshooting

### "API key not valid"

- Check if the API key is correctly copied
- Verify the key is not restricted to wrong domains
- Make sure billing is enabled

### "Maps JavaScript API not enabled"

- Go back to APIs & Services → Library
- Search and enable "Maps JavaScript API"

### "Referer restrictions"

- Add `localhost:5173/*` for development
- Add your production domain for deployment

### Still not working?

- Check browser console for detailed error messages
- Verify `.env` file is in the project root
- Restart the development server after changes

## 💰 Google Maps Pricing

- **Free tier**: $200/month credit
- **Pay-as-you-go**: ~$7 per 1,000 map loads
- **Development**: Usually stays within free tier

## 🚀 Next Steps

1. Get your Google Maps API key
2. Add it to `.env` as `VITE_GOOGLE_MAPS_API_KEY`
3. Restart the development server
4. Your incident map should now display properly!

---

**Need help?** Let me know if you encounter any issues with the setup!