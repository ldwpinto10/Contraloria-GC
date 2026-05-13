
"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Hash, 
  Store, 
  LayoutDashboard,
  Plus,
  Trash2,
  CheckCircle2,
  ClipboardList,
  UserCircle,
  Handshake,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HandoverReportDialog } from "@/components/petty-cash/HandoverReportDialog";
import Link from "next/link";

const INITIAL_ITEMS = [
  "LLAVES BUZON DE SEGURIDAD",
  "LLAVES CAJA FUERTE",
  "LLAVES DE RESTAURANTES",
  "VARIPOS",
  "GUARDAMONEDAS",
  "EQUIPO PAX BAC",
  "COBERTORES EQUIPO PAX",
  "CARGADORES EQUIPO PAX",
  "TABLET FECHADO O INVENTARIO",
  "IMPRESORA FECHADO",
  "IMPRESORA DE FACTURA",
  "POS BAC",
  "POS FICOHSA"
];

interface HandoverItem {
  id: string;
  description: string;
  quantity: string;
  observations: string;
}

export default function ControlTraspasoPage() {
  const [unitBrand, setUnitBrand] = useState<string>("");
  const [unitNumber, setUnitNumber] = useState("");
  const [deliveryName, setDeliveryName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [items, setItems] = useState<HandoverItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [newItemDescription, setNewItemDescription] = useState("");

  useEffect(() => {
    localStorage.removeItem("contraloria_gc_traspaso_v3_final_reported");
    const saved = localStorage.getItem("contraloria_gc_traspaso_v3_final");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnitBrand(data.unitBrand || "");
        setUnitNumber(data.unitNumber || "");
        setDeliveryName(data.deliveryName || "");
        setReceiverName(data.receiverName || "");
        setItems(data.items || INITIAL_ITEMS.map((desc, i) => ({
          id: i.toString(), description: desc, quantity: "", observations: ""
        })));
      } catch (e) { console.error("Error loading previous session", e); }
    } else {
      setItems(INITIAL_ITEMS.map((desc, i) => ({
        id: i.toString(), description: desc, quantity: "", observations: ""
      })));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const data = { unitBrand, unitNumber, deliveryName, receiverName, items };
    localStorage.setItem("contraloria_gc_traspaso_v3_final", JSON.stringify(data));
  }, [unitBrand, unitNumber, deliveryName, receiverName, items, isMounted]);

  const handleUpdateItem = (id: string, field: keyof HandoverItem, value: string) => {
    let processedValue = value;
    if (field === 'observations' && value.length > 0) processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: processedValue } : item));
  };

  const handleAddItem = () => {
    if (!newItemDescription.trim()) return;
    const newItem: HandoverItem = { id: Date.now().toString(), description: newItemDescription.toUpperCase(), quantity: "", observations: "" };
    setItems(prev => [...prev, newItem]);
    setNewItemDescription("");
  };

  const handleDeleteItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));

  const handleUnitNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) { setUnitNumber(""); return; }
    const num = parseInt(val, 10);
    setUnitNumber(num < 10 ? `0${num}` : num.toString());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-[900] text-slate-800 tracking-tighter uppercase leading-none whitespace-nowrap">
              Contraloria <span className="text-primary">GC</span>
            </h2>
          </div>
          <Link href="/" prefetch={true}>
            <div className="inline-flex items-center gap-2 font-black text-muted-foreground hover:text-primary transition-colors cursor-pointer group bg-white px-4 py-2 rounded-full border shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.2em]">MENÚ PRINCIPAL</span>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-3 w-fit mx-auto">
            <Handshake className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Módulo Activo</p>
              <p className="text-xs font-bold text-emerald-700">CONTROL DE TRASPASO</p>
            </div>
          </div>

          <div className="bg-emerald-50 p-5 rounded-xl shadow-sm border border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><Store className="h-3 w-3" />Marca</Label>
                <Select value={unitBrand} onValueChange={setUnitBrand}>
                  <SelectTrigger className="h-10 font-bold bg-white border-emerald-100"><SelectValue placeholder="Seleccione Marca" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza Hut">Pizza Hut</SelectItem>
                    <SelectItem value="KFC">KFC</SelectItem>
                    <SelectItem value="Dennys">Dennys</SelectItem>
                    <SelectItem value="China Wok">China Wok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><Hash className="h-3 w-3" />Unidad</Label>
                <input type="text" placeholder="Ej. 05" value={unitNumber} onChange={handleUnitNumberChange} className="h-10 font-bold bg-white border-emerald-100 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><UserCircle className="h-3 w-3" />Quien entrega</Label>
                <input type="text" placeholder="Nombre responsable" value={deliveryName} onChange={(e) => setDeliveryName(e.target.value.toUpperCase())} className="flex h-10 w-full rounded-md border border-emerald-100 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><UserCircle className="h-3 w-3" />Quien recibe</Label>
                <input type="text" placeholder="Nombre responsable" value={receiverName} onChange={(e) => setReceiverName(e.target.value.toUpperCase())} className="flex h-10 w-full rounded-md border border-emerald-100 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><Plus className="h-3 w-3" />Añadir Nueva Descripción</Label>
              <Input value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} className="h-10 border-emerald-100 focus-visible:ring-emerald-500 uppercase text-xs font-bold" placeholder="EJ. NUEVO EQUIPO O ACTIVO..." />
            </div>
            <Button onClick={handleAddItem} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 font-black text-xs gap-2 shadow-md"><Plus className="h-4 w-4" />AGREGAR</Button>
          </div>

          <Card className="bg-white shadow-md border-none overflow-hidden rounded-xl">
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3"><ClipboardList className="h-5 w-5" /><h3 className="font-black uppercase tracking-tight text-sm">AUDITORIA DE ACTIVOS - TRASPASO DE ADMINISTRACION</h3></div>
              <div className="flex items-center gap-2"><div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-[10px] font-bold"><CheckCircle2 className="h-3 w-3" />ACTIVOS: {items.length}</div></div>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 border-b-2">
                  <TableRow className="h-12">
                    <TableHead className="w-24 font-black text-slate-900 uppercase tracking-widest text-[10px] text-center bg-emerald-50/50">CANTIDAD</TableHead>
                    <TableHead className="w-1/2 font-black text-slate-900 uppercase tracking-widest text-[10px] bg-emerald-50/50 border-x">DESCRIPCIÓN</TableHead>
                    <TableHead className="font-black text-slate-900 uppercase tracking-widest text-[10px] bg-emerald-50/50">OBSERVACIONES</TableHead>
                    <TableHead className="w-12 bg-emerald-50/50"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="h-14 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-2"><Input type="number" inputMode="numeric" value={item.quantity} onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)} className="h-9 text-center font-black border-slate-200 focus-visible:ring-emerald-500 text-sm" placeholder="0" /></TableCell>
                      <TableCell className="text-slate-700 text-[12px] px-4 font-bold border-x">{item.description}</TableCell>
                      <TableCell className="px-4"><Input type="text" value={item.observations} onChange={(e) => handleUpdateItem(item.id, 'observations', e.target.value)} className="h-9 border-slate-200 focus-visible:ring-emerald-500 text-[10px]" placeholder="Anotar detalles..." /></TableCell>
                      <TableCell className="px-2 text-center"><Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-center pb-12">
            <div className="max-w-md w-full">
              <HandoverReportDialog items={items} unitBrand={unitBrand} unitNumber={unitNumber} deliveryName={deliveryName} receiverName={receiverName} />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] mt-auto">
        <p>2026 CONTRALORÍA GRUPO COMIDAS • CGC SISTEMA DE CONTROLES OPERATIVOS. LP</p>
      </footer>
    </div>
  );
}
