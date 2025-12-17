// src/lib/syncUserToFirestore.ts
import { User } from 'firebase/auth';
import { db } from '@/lib/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function syncUserToFirestore(user: User) {
  if (!user?.uid) return;

  const userRef = doc(db, 'users', user.uid);
  
  // Salva os dados básicos do usuário
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    createdAt: serverTimestamp(),
    // googleCalendarTokens será adicionado depois
  }, { merge: true }); // merge: true evita sobrescrever dados existentes
}