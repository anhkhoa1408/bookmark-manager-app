import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? process.env.VITE_FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? process.env.VITE_FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, "\n"),
};

const app: App = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(firebaseAdminConfig),
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
