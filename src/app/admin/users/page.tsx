'use client';

import { useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCog, Trash2, Plus, ShieldCheck, LayoutDashboard, Search, Mail, User as UserIcon, Lock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const db = useFirestore();
  const { data: users, loading } = useCollection(db ? collection(db, 'users') : null);
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('User');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddUser = () => {
    if (!db || !newName || !newEmail || !newPassword) return;
    
    const sanitizedEmail = newEmail.toLowerCase().trim();
    const userId = sanitizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    
    setDoc(doc(db, 'users', userId), {
      name: newName.toUpperCase().trim(),
      email: sanitizedEmail,
      role: newRole,
      password: newPassword
    });
    
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('User');
  };

  const handleDeleteUser = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'users', id));
  };

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none whitespace-nowrap">
              Contraloria <span className="text-primary">GC</span>
            </h2>
          </div>
          <Link href="/" prefetch={true} className="inline-flex items-center gap-2 font-black text-muted-foreground hover:text-primary transition-all cursor-pointer group bg-white px-4 py-2 rounded-full border shadow-sm active:scale-95">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.2em]">MENÚ PRINCIPAL</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-xl rounded-2xl h-fit overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Nuevo Acceso</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3" /> Nombre Completo
                </Label>
                <Input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="JUAN PEREZ" 
                  className="h-11 font-bold uppercase text-xs" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Correo Electrónico
                </Label>
                <Input 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="usuario@contraloriagc.com" 
                  className="h-11 font-bold text-xs" 
                  type="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Contraseña
                </Label>
                <Input 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="h-11 font-bold text-xs" 
                  type="password"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Nivel de Acceso</Label>
                <Select value={newRole} onValueChange={newRole => setNewRole(newRole)}>
                  <SelectTrigger className="h-11 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">ADMINISTRADOR</SelectItem>
                    <SelectItem value="Supervisor">SUPERVISOR</SelectItem>
                    <SelectItem value="User">USUARIO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full h-12 font-black uppercase text-xs gap-2 mt-4 shadow-lg active:scale-95 transition-all">
                <Plus className="h-4 w-4" /> REGISTRAR USUARIO
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-xl overflow-hidden rounded-2xl">
            <CardHeader className="bg-white border-b p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserCog className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Personal Autorizado</CardTitle>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="BUSCAR USUARIO..." 
                    className="pl-9 h-9 text-[10px] font-bold uppercase tracking-widest bg-slate-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase pl-6 py-4">PERFIL</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center">NIVEL</TableHead>
                      <TableHead className="w-20 pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((u: any) => (
                      <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black uppercase text-[11px] text-slate-800 tracking-tight leading-none mb-1">{u.name}</span>
                            <span className="text-[10px] font-bold text-slate-400">{u.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            u.role === 'Admin' ? "bg-primary/5 text-primary border-primary/20" :
                            u.role === 'Supervisor' ? "bg-orange-50 text-orange-600 border-orange-200" :
                            "bg-slate-50 text-slate-500 border-slate-200"
                          )}>
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteUser(u.id)} 
                            className="h-8 w-8 text-slate-200 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filteredUsers?.length && !loading && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-48 text-center text-slate-300">
                          <div className="flex flex-col items-center gap-2 opacity-50">
                            <Search className="h-8 w-8" />
                            <p className="font-black uppercase text-[10px] tracking-[0.2em]">No se encontraron registros</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}