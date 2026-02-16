import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

export const adminAuth = getAuth(app);
