import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      // If Firebase config is missing, just proceed without auth
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUid(currentUser.uid);
        setIsAuthReady(true);
      } else {
        // If not logged in, sign in anonymously
        signInAnonymously(auth!).catch((error) => {
          console.error("Anonymous auth failed:", error);
          setIsAuthReady(true); // Proceed anyway on failure
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, uid, isAuthReady };
}
