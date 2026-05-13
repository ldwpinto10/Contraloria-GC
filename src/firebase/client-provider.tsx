
'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<{
    app: FirebaseApp | null;
    db: Firestore | null;
    auth: Auth | null;
  } | null>(null);

  useEffect(() => {
    try {
      const { firebaseApp, firestore, auth } = initializeFirebase();
      setServices({ app: firebaseApp, db: firestore, auth });
    } catch (e) {
      console.error("Firebase initialization failed: ", e);
      // Fallback to null services to allow public access even with invalid config
      setServices({ app: null, db: null, auth: null });
    }
  }, []);

  if (!services) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Iniciando CGC...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.app as any}
      firestore={services.db as any}
      auth={services.auth as any}
    >
      {children}
    </FirebaseProvider>
  );
};
