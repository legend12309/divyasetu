# Quick Start Guide

Get your Divya Grihsetu app running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn
- Expo Go app on your phone (for testing)
- Firebase account (free)

## Setup Steps

### 1. Install Dependencies
```bash
cd DivyaGrihsetu
npm install
```

### 2. Firebase Configuration

**Option A: Quick Test (Skip Firebase for now)**
- The app will show a login screen but won't save data
- You can explore the UI design and layout

**Option B: Full Setup (Recommended)**
1. Create a Firebase project: https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Copy your config to `config/firebase.ts`
5. See `SETUP_YOUR_FIREBASE.md` for detailed instructions

### 3. Run the App

**For Mobile Testing:**
```bash
npm start
```
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Scan QR code with Expo Go app

**For Web Testing:**
```bash
npm run web
```

## Demo Account

After Firebase setup, use these credentials:
- **Email**: demo@divyagrihsetu.com
- **Password**: demo123

(You need to create this account first in Firebase)

## Features to Test

### ✅ Home Screen
- View family dashboard
- Quick stats (groceries, chores, rituals)
- Quick actions to all features
- Budget overview

### ✅ Grocery Tracker
- Add items with voice or text
- Filter by category (Fruits, Dairy, etc.)
- Mark items as complete
- Priority levels

### ✅ Meal Planner
- Weekly calendar view
- Plan breakfast, lunch, dinner, snacks
- Add meal recipes

### ✅ Household Chores
- Assign chores to family members
- Set due dates
- Track completion
- Priority and categories

### ✅ Budget Tracker
- Weekly/monthly budgets
- Category-wise spending
- Transaction history
- Visual progress indicators

### ✅ Ritual Reminders
- Indian festivals and religious events
- Custom ritual reminders
- Voice announcements

## Troubleshooting

### "Module not found" error
```bash
rm -rf node_modules
npm install
```

### Firebase auth error
- Check your Firebase configuration
- Make sure Email/Password auth is enabled
- Verify Firestore is created

### Voice not working
- Check app permissions on your device
- Make sure microphone permission is granted
- Try restarting the app

### Build errors
```bash
npm start -- --clear
```

## Next Steps

1. Customize colors in `theme/colors.ts`
2. Add your family name and details
3. Set up Firestore security rules
4. Configure push notifications
5. Deploy to app stores

## Need Help?

- Read `README.md` for detailed documentation
- Check `FIREBASE_SETUP.md` for Firebase configuration
- View code comments for implementation details

## App Store Deployment

### Android
```bash
eas build --platform android
eas submit --platform android
```

### iOS
```bash
eas build --platform ios
eas submit --platform ios
```

Note: You need EAS CLI for deployment:
```bash
npm install -g eas-cli
eas login
```

---

**Happy Family Managing! 👨‍👩‍👧‍👦**

