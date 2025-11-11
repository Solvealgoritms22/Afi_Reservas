import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function getFirebaseConfig(): FirebaseOptions {
  const cfg: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || undefined,
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  };

  // Validación mínima para ayudar en desarrollo
  if (!cfg.apiKey || !cfg.projectId || !cfg.appId) {
    console.warn(
      "Configuración de Firebase incompleta. Define variables VITE_FIREBASE_* en .env. Usando valores de demostración.",
    );
    cfg.apiKey = cfg.apiKey || "demo-api-key";
    cfg.projectId = cfg.projectId || "demo-project";
    cfg.appId = cfg.appId || "demo-app-id";
    cfg.authDomain = cfg.authDomain || "demo-project.firebaseapp.com";
  }
  return cfg;
}

const app = initializeApp(getFirebaseConfig());
export const auth = getAuth(app);
export const db = getFirestore(app);
// Fija explícitamente el bucket si está definido en .env
const bucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || undefined;
export const storage = bucket ? getStorage(app, `gs://${bucket}`) : getStorage(app);

export default app;