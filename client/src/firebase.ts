import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if core config fields are present
const isConfigValid = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.appId && 
  firebaseConfig.projectId
);

const app = isConfigValid
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

// Initialize Auth and Firestore
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Initialize Analytics lazily and safely
export let analytics: any = null;

if (app) {
  isSupported().then(supported => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.error("Firebase Analytics initialization failed:", err);
      }
    }
  }).catch(err => console.error("Firebase Analytics support check failed:", err));
}

export const logEvent = (analyticsInstance: any, eventName: string, eventParams?: any) => {
  if (analyticsInstance) {
    firebaseLogEvent(analyticsInstance, eventName, eventParams);
  } else {
    console.log(`[Analytics-Offline] ${eventName}:`, eventParams);
  }
};
