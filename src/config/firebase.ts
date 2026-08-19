import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCpX4or0-a2OHjTDOy3z0UOIPGz6ttRwvE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'stageplot-builder-4b7564.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'stageplot-builder-4b7564',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'stageplot-builder-4b7564.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '71107609731',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:71107609731:web:7f109d8e2d392f53f147b6',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    !firebaseConfig.apiKey.includes('placeholder')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase SDK:', error);
  }
}

export {
  app,
  auth,
  db,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
};
export type { User };
