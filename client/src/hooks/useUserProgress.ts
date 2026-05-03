import { useCallback } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';
import { useUser } from '../context/UserContext';

export interface UserProgress {
  score: number;
  completedAt: Date | any;
  persona: string;
  gapAreas: string[];
}

export function useUserProgress() {
  const { uid } = useAuth();
  const { persona } = useUser();

  const saveProgress = useCallback(async (score: number, gapAreas: string[]) => {
    if (!db || !uid || !persona) return;

    try {
      const docRef = doc(db, 'userProgress', uid);
      await setDoc(docRef, {
        score,
        completedAt: serverTimestamp(),
        persona,
        gapAreas,
      });
      console.log('User progress saved successfully.');
    } catch (error) {
      console.error('Failed to save user progress:', error);
    }
  }, [uid, persona]);

  const loadProgress = useCallback(async (): Promise<UserProgress | null> => {
    if (!db || !uid) return null;

    try {
      const docRef = doc(db, 'userProgress', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserProgress;
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
    return null;
  }, [uid]);

  return { saveProgress, loadProgress };
}
