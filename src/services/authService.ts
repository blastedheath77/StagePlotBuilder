import {
  auth,
  isFirebaseConfigured,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from '../config/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous?: boolean;
}

interface LocalUserRecord {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: number;
}

const LOCAL_USERS_KEY = 'stageplot_local_users';
const LOCAL_SESSION_KEY = 'stageplot_local_session';

export class AuthService {
  private static getLocalUsers(): LocalUserRecord[] {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalUsers(users: LocalUserRecord[]): void {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch {}
  }

  private static getLocalSession(): AppUser | null {
    try {
      const data = localStorage.getItem(LOCAL_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static setLocalSession(user: AppUser | null): void {
    try {
      if (user) {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    } catch {}
  }

  static onAuthStateChanged(callback: (user: AppUser | null) => void): () => void {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAnonymous: firebaseUser.isAnonymous,
          });
        } else {
          callback(null);
        }
      });
    } else {
      // Local development session listener
      const localUser = this.getLocalSession();
      callback(localUser);
      const storageListener = () => {
        callback(this.getLocalSession());
      };
      window.addEventListener('storage', storageListener);
      return () => window.removeEventListener('storage', storageListener);
    }
  }

  static async signUpWithEmail(email: string, password: string, displayName?: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || cred.user.displayName,
      };
    }

    // Local Auth Implementation (when Firebase keys are not in .env)
    const users = this.getLocalUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      const error: any = new Error('An account with this email already exists.');
      error.code = 'auth/email-already-in-use';
      throw error;
    }

    const newUser: LocalUserRecord = {
      uid: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: cleanEmail,
      displayName: displayName?.trim() || cleanEmail.split('@')[0],
      passwordHash: btoa(password), // Simple local hashing
      createdAt: Date.now(),
    };

    users.push(newUser);
    this.saveLocalUsers(users);

    const appUser: AppUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
    };
    this.setLocalSession(appUser);
    window.dispatchEvent(new Event('storage'));
    return appUser;
  }

  static async signInWithEmail(email: string, password: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
      };
    }

    // Local Auth Implementation
    const users = this.getLocalUsers();
    const found = users.find((u) => u.email === cleanEmail && u.passwordHash === btoa(password));

    if (!found) {
      const error: any = new Error('Incorrect email or password.');
      error.code = 'auth/invalid-credential';
      throw error;
    }

    const appUser: AppUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName,
    };
    this.setLocalSession(appUser);
    window.dispatchEvent(new Event('storage'));
    return appUser;
  }

  static async sendPasswordReset(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, cleanEmail);
      return;
    }

    // Local Auth Simulation
    const users = this.getLocalUsers();
    const exists = users.some((u) => u.email === cleanEmail);
    if (!exists) {
      const error: any = new Error('No account found with this email.');
      error.code = 'auth/user-not-found';
      throw error;
    }
  }

  static async signInWithGoogle(): Promise<AppUser> {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
      };
    }

    // Local Mock Google Sign-In
    const googleUser: AppUser = {
      uid: `google_${Date.now()}`,
      email: 'demo.soundtech@gmail.com',
      displayName: 'Alex (Google Demo)',
    };
    this.setLocalSession(googleUser);
    window.dispatchEvent(new Event('storage'));
    return googleUser;
  }

  static async signInAsGuest(): Promise<AppUser> {
    if (isFirebaseConfigured && auth) {
      const cred = await signInAnonymously(auth);
      return {
        uid: cred.user.uid,
        email: null,
        displayName: 'Guest Sound Tech',
        isAnonymous: true,
      };
    }

    const guestUser: AppUser = {
      uid: `guest_${Date.now()}`,
      email: null,
      displayName: 'Guest Sound Tech',
      isAnonymous: true,
    };
    this.setLocalSession(guestUser);
    window.dispatchEvent(new Event('storage'));
    return guestUser;
  }

  static async signOut(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    this.setLocalSession(null);
    window.dispatchEvent(new Event('storage'));
  }
}
