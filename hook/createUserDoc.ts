import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { app } from '../lib/firebaseConfig';

const db = getFirestore(app);

/**
 * Cria documento do usuário no Firestore se não existir.
 */
export async function createUserDoc(user: User) {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  // Evita sobrescrever se o documento já existir
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || 'Novo Usuário',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
    });
    console.log('✅ Documento criado para o usuário:', user.uid);
  } else {
    console.log('ℹ️ Documento do usuário já existe');
  }
}
