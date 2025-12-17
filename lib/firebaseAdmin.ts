// lib/firebaseAdmin.ts
import admin from "firebase-admin";

// Inicializa apenas se ainda não foi inicializado
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Erro ao inicializar Firebase Admin:", error);
    throw new Error("Falha na inicialização do Firebase Admin SDK");
  }
}

// Exportações nomeadas para uso direto
export const db = admin.firestore();
export const auth = admin.auth();
export default admin;