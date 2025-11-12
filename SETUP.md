# Firebase Setup Guide

## Quick Setup Steps

### 1. Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google**:
   - Click on Google
   - Toggle "Enable"
   - Add your project support email
   - Save
3. Enable **Email/Password**:
   - Click on Email/Password
   - Toggle "Enable"
   - Save

### 3. Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click "Create database"
3. Choose **Production mode** (or Test mode for development)
4. Select a location for your database
5. Click "Enable"

### 4. Set Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll to "Your apps" section
3. If you don't have a web app, click the **Web icon** (`</>`)
4. Register your app with a nickname (e.g., "Futuristic Games")
5. Copy the `firebaseConfig` object

### 6. Update Your Code

Open `src/config/firebaseConfig.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "AIza...", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### 7. Test the Setup

1. Run `npm run dev`
2. Navigate to `/signup` or `/login`
3. Try signing in with Google or creating an account
4. Check Firestore to see if user data is being created

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Authentication > Settings > Authorized domains
- Add your domain (e.g., `localhost` for development)

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Ensure the user is authenticated
- Verify the user ID matches the document path

### Three.js not loading
- Ensure `three` is installed: `npm install three @types/three`
- Check browser console for errors
- The background will only render on the client side

## Database Structure

The app creates the following structure in Firestore:

```
users/
  {userId}/
    profile/
      name: string
      email: string
      photoURL: string
      createdAt: string
    stats/
      memoryMatch/
        bestScore: number
        bestTime: number
        gamesPlayed: number
        difficulty: string
      puzzleTime/
        bestTime: number
        bestMoves: number
        bestScore: number
        gamesPlayed: number
        difficulty: string
      sudoku/
        bestTime: number
        bestScore: number
        gamesPlayed: number
        difficulty: string
```

