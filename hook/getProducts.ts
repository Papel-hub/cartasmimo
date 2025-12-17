// lib/getProducts.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // seu arquivo Firebase

export async function getProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
