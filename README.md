# Divya Grihsetu 👨‍👩‍👧‍👦

**Divya Grihsetu** is a beautiful, family-centered mobile application designed to help Indian families manage their household activities seamlessly. Built with React Native and Firebase, it offers an intuitive interface with warm Indian colors and thoughtful features for every family member.

## 🌟 Features

### 📱 Core Features
- **Role-Based Access**: Admin and Member roles for controlled access
- **Grocery Tracker**: Smart shopping lists with categories and priorities
- **Meal Planner**: Weekly meal planning with breakfast, lunch, dinner, and snacks
- **Household Chores**: Task management with assignments and reminders
- **Budget Tracker**: Family budget monitoring with category-wise spending
- **Ritual Reminders**: Traditional Indian rituals, festivals, and religious events

### 🎨 Design Highlights
- **Warm Indian Color Palette**: Primary color #E89B34 with cream background
- **Family-Centered UI**: Emotional, warm, and intuitive interface
- **Microanimations**: Smooth transitions and interactions
- **Rounded Corners**: Modern, friendly design language
- **Accessibility**: Voice input and text-to-speech for elderly users

### 🎤 Voice Features
- Voice commands for adding items
- Text-to-speech for reminders
- Indian English (en-IN) support
- Accessibility for all age groups

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: React Context API
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Animation**: React Native Reanimated
- **Voice**: Expo Speech, React Native Voice
- **Icons**: Expo Vector Icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DivyaGrihsetu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - See `SETUP_YOUR_FIREBASE.md` for detailed instructions
   - Create Firebase project, enable Auth, Firestore, and Storage
   - Copy configuration to `config/firebase.ts`

4. **Run the app**
   ```bash
   npm start
   ```

   Then press:
   - `a` for Android
   - `i` for iOS
   - `w` for Web

## 🔥 Firebase Setup

**For complete setup instructions, see**: [`SETUP_YOUR_FIREBASE.md`](SETUP_YOUR_FIREBASE.md)

**Quick overview**:
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Get your config and add to `config/firebase.ts`
5. Deploy security rules from `firestore.rules`

All detailed in `SETUP_YOUR_FIREBASE.md`

## 📁 Project Structure

```
DivyaGrihsetu/
├── App.tsx                 # Main app component with navigation
├── assets/                 # Images and icons
├── components/             # Reusable UI components
│   └── VoiceInputButton.tsx
├── config/                 # Configuration files
│   └── firebase.ts        # Firebase setup
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication context
├── screens/               # Screen components
│   ├── Auth/
│   │   └── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── GroceryScreen.tsx
│   ├── MealsScreen.tsx
│   ├── ChoresScreen.tsx
│   ├── BudgetScreen.tsx
│   └── RitualsScreen.tsx
├── theme/                 # Design system
│   ├── colors.ts          # Color palette
│   ├── spacing.ts         # Spacing system
│   ├── typography.ts      # Typography styles
│   └── index.ts
├── types/                 # TypeScript definitions
│   └── index.ts
└── utils/                 # Utility functions
    └── voiceInput.ts      # Voice input service
```

## 🎨 Design System

### Colors
- **Primary**: #E89B34 (Warm Golden Orange)
- **Background**: #FFF9F3 (Warm Cream)
- **Success**: #4CAF50 (Green)
- **Error**: #F44336 (Red)
- **Feature Colors**: 
  - Grocery: Green
  - Meals: Orange
  - Chores: Blue
  - Budget: Purple
  - Rituals: Amber

### Typography
- **Headings**: Bold, 28-32px
- **Body**: Regular, 14-16px
- **Captions**: Regular, 12px

## 👥 User Roles

### Admin
- Full access to all features
- Can add/remove family members
- Manage budget and settings
- Create rituals and reminders

### Member
- View and update assigned chores
- Add grocery items
- Add expenses (depending on settings)
- View meal plans and rituals

## 🚀 Key Features in Detail

### Grocery Tracker
- Category-based organization
- Priority levels (High, Medium, Low)
- Quantity and unit tracking
- Voice input support
- Real-time synchronization

### Meal Planner
- Weekly meal calendar
- Breakfast, Lunch, Dinner, Snacks
- Recipe management
- Shopping list integration

### Household Chores
- Task assignment
- Due dates and reminders
- Frequency settings (Once, Daily, Weekly, Monthly)
- Priority levels
- Completion tracking

### Budget Tracker
- Category-wise spending
- Weekly/Monthly/Yearly views
- Visual progress indicators
- Transaction history
- Remaining balance tracking

### Ritual Reminders
- Indian festivals and events
- Religious observances
- Custom reminders
- Voice announcements
- Family-wide notifications

## 🔐 Security

- Firebase Authentication
- Firestore Security Rules
- Role-based access control
- Encrypted data transmission
- Secure storage for sensitive data

## 📱 Accessibility

- Large, readable fonts
- High contrast colors
- Voice input for hands-free operation
- Text-to-speech for announcements
- Simple navigation patterns
- Touch-friendly buttons

## 🧪 Testing

For testing, use the demo account:
- **Email**: demo@divyagrihsetu.com
- **Password**: demo123

## 🤝 Contributing

This is a family management application. For issues or suggestions:
1. Check existing issues
2. Create a new issue with detailed description
3. Follow the code style guidelines

## 📄 License

Copyright © 2024 Divya Grihsetu. All rights reserved.

## 🙏 Acknowledgments

- Design inspiration from Indian culture and values
- Built with love for families
- Powered by React Native and Firebase

## 📞 Support

For support, email support@divyagrihsetu.com or create an issue in the repository.

---

**Made with ❤️ for Indian Families**

