
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  // Verificamos si la llave es un placeholder para evitar errores críticos de inicialización
  const config = { ...firebaseConfig };
  if (config.apiKey.includes("AIzaSy...") || config.apiKey === "") {
    console.warn("Firebase: API Key no configurada correctamente.");
  }

  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
