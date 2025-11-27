# MINI_PROJECT

## Project info

**URL**: https://miniproject-25331.web.app

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d9907d96-484e-4e30-a034-64285bd13533) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Authentication & Firestore)
- Three.js (3D animations)

## Setup Instructions

### 1. Install Dependencies

```sh
npm install
```

**Required packages:**
- `firebase` - For authentication and database
- `three` - For 3D background animations
- `@types/three` - TypeScript types for Three.js

If these aren't installed, run:
```sh
npm install firebase three @types/three
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Google** sign-in provider
   - Enable **Email/Password** sign-in provider
4. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode (or test mode for development)
   - Set up security rules (see below)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the `firebaseConfig` object

6. Update `src/config/firebaseConfig.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

### 3. Firestore Security Rules

Set up these security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run the Development Server

```sh
npm run dev
```

The app will be available at `http://localhost:8080`

## Features

- 🔐 **Firebase Authentication**: Google Sign-In and Email/Password
- 🎮 **6 Interactive Games**:
  - Tic Tac Toe
  - Number Guessing
  - Word Guessing
  - Memory Match (NEW)
  - Puzzle Time (NEW)
  - Sudoku (NEW)
- 🎯 **Game Features**:
  - 3 difficulty levels (Easy, Medium, Hard)
  - Play with Computer or Friend modes
  - Real-time stats tracking
  - Progress saved to Firestore
- 🌓 **Dark/Light Mode**: Toggle theme with the button in navbar
- ✨ **Three.js Animations**: Futuristic 3D particle background
- 📊 **User Profile**: View your game statistics and achievements
- 🎨 **Modern UI**: Glassmorphism, neon gradients, smooth animations

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d9907d96-484e-4e30-a034-64285bd13533) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
