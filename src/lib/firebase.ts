import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export function logout() {
  return auth.signOut();
}

export async function getUserProfile(userId: string) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function saveUserProfile(userId: string, profile: any) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, {
    ...profile,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function logIncident(incident: any) {
  const colRef = collection(db, 'incidents');
  return await addDoc(colRef, {
    ...incident,
    createdAt: serverTimestamp(),
  });
}

export async function logTaskCompletion(log: any) {
  const colRef = collection(db, 'taskLogs');
  return await addDoc(colRef, {
    ...log,
    completedAt: serverTimestamp(),
  });
}

export async function getSafetyAudits(userId: string) {
  const q = query(
    collection(db, 'safety_audits'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function saveQuizResult(userId: string, score: number, totalQuestions: number) {
  await addDoc(collection(db, 'quiz_results'), {
    userId,
    score,
    totalQuestions,
    timestamp: serverTimestamp(),
  });
}
