
'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, AlertCircle, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const isConfigMissing = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("AIzaSy...") || firebaseConfig.apiKey === "";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfigMissing) {
      toast({ variant: "destructive", title: "Configuración Requerida", description: "Debes ingresar una API Key válida." });
      return;
    }
    if (!auth || !db) return;
    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(doc(db, 'users', userId), {
          name: name.toUpperCase().trim(),
          email: email.toLowerCase().trim(),
          role: 'User'
        });
        toast({ title: "Cuenta creada", description: "Iniciando sesión..." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Credenciales inválidas." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tighter uppercase">CONTRALORÍA GC</CardTitle>
            <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-slate-400">
              Gestión y Auditoría Profesional
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Link href="/" className="block">
            <Button variant="outline" className="w-full h-12 border-2 border-primary/20 hover:bg-primary/5 text-primary font-black uppercase text-xs tracking-widest gap-2">
              <Globe className="h-4 w-4" />
              INGRESAR EN MODO PÚBLICO
            </Button>
          </Link>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-white px-2 text-slate-400 tracking-widest">O CON CREDENCIALES</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre Completo</Label>
                <Input placeholder="JUAN PÉREZ" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 font-bold uppercase" />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Correo Electrónico</Label>
              <Input type="email" placeholder="usuario@contraloriagc.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 font-bold" />
            </div>
            <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg mt-2" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isRegistering ? "CREAR CUENTA" : "INGRESAR")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
            {isRegistering ? "¿Ya tienes cuenta? Inicia Sesión" : "¿Eres nuevo? Regístrate aquí"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
