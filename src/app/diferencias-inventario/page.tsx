
"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { InventoryDifferenceItem, CurrencyCode, CURRENCIES } from "@/types";
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
  CircleDollarSign,
  ClipboardList,
  Trash2,
  PlusCircle,
  Package,
  Percent,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DifferenceReportDialog } from "@/components/petty-cash/DifferenceReportDialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

const InventoryDifferenceRow = memo(({ 
  item, 
  onUpdate, 
  onDelete 
}: { 
  item: InventoryDifferenceItem; 
  onUpdate: (id: string, field: keyof InventoryDifferenceItem, value: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <TableRow key={item.id} className="h-12 border-b group">
      <TableCell className="pl-4 py-1">
        <Input 
          defaultValue={item.product} 
          onChange={(e) => onUpdate(item.id, 'product', e.target.value.toUpperCase())}
          className="h-8 text-[11px] font-bold bg-transparent border-none shadow-none focus-visible:ring-0 uppercase placeholder:text-slate-300"
          placeholder="NOMBRE DEL PRODUCTO..."
        />
      </TableCell>
      <TableCell className="p-1">
        <Select value={item.unit} onValueChange={(val) => onUpdate(item.id, 'unit', val)}>
          <SelectTrigger className="h-8 text-[10px] text-center font-black bg-slate-50/50 border-none shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNIDAD">UNIDAD</SelectItem>
            <SelectItem value="LIBRA">LIBRA</SelectItem>
            <SelectItem value="GALON">GALON</SelectItem>
            <SelectItem value="CAJA">CAJA</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="p-1 border-x">
        <Input 
          type="number"
          step="0.01"
          defaultValue={item.physical} 
          onChange={(e) => onUpdate(item.id, 'physical', e.target.value)}
          className="h-8 text-[11px] text-center font-black bg-slate-50/50"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell className="p-1">
        <Input 
          type="number"
          step="0.01"
          defaultValue={item.entered} 
          onChange={(e) => onUpdate(item.id, 'entered', e.target.value)}
          className="h-8 text-[11px] text-center font-black bg-slate-50/50"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell className="p-1 border-x">
        <Input 
          type="number"
          step="0.01"
          defaultValue={item.price} 
          onChange={(e) => onUpdate(item.id, 'price', e.target.value)}
          className="h-8 text-[11px] text-center font-black bg-slate-50/50"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell className="p-1">
        <Input 
          defaultValue={item.comments} 
          onChange={(e) => onUpdate(item.id, 'comments', e.target.value)}
          className="h-8 text-[10px] font-medium bg-transparent border-none shadow-none focus-visible:ring-0"
          placeholder="AGREGAR NOTA..."
        />
      </TableCell>
      <TableCell className="p-1">
        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
});
InventoryDifferenceRow.displayName = "InventoryDifferenceRow";

export default function DiferenciasInventarioPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('HNL');
  const [unitBrand, setUnitBrand] = useState<string>("");
  const [unitNumber, setUnitNumber] = useState("");
  const [salesValue, setSalesValue] = useState<string>("");
  const [items, setItems] = useState<InventoryDifferenceItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    localStorage.removeItem("contraloria_gc_differences_v2_reported");
    const saved = localStorage.getItem("contraloria_gc_differences_v2");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCurrency(data.currency || 'HNL');
        setUnitBrand(data.unitBrand || "");
        setUnitNumber(data.unitNumber || "");
        setSalesValue(data.salesValue || "");
        setItems(data.items || []);
      } catch (e) {
        console.error("Error cargando sesión previa", e);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const data = { currency, unitBrand, unitNumber, salesValue, items };
    localStorage.setItem("contraloria_gc_differences_v2", JSON.stringify(data));
  }, [currency, unitBrand, unitNumber, salesValue, items, isMounted]);

  const stats = useMemo(() => {
    let positiveImpact = 0;
    let totalItems = 0;
    items.forEach(i => {
      if (i.product.trim() === "") return;
      totalItems++;
      const phys = parseFloat(i.physical) || 0;
      const ent = parseFloat(i.entered) || 0;
      const price = parseFloat(i.price) || 0;
      const impact = (phys - ent) * price;
      if (impact > 0.001) positiveImpact += impact;
    });
    const sales = parseFloat(salesValue) || 0;
    const impactPercentage = sales > 0 ? (positiveImpact / sales) * 100 : 0;
    return { positiveImpact, totalItems, impactPercentage };
  }, [items, salesValue]);

  const handleAddItem = () => {
    const newItem: InventoryDifferenceItem = {
      id: Date.now().toString(),
      product: "",
      unit: "UNIDAD",
      physical: "",
      entered: "",
      price: "",
      comments: ""
    };
    setItems(prev => [newItem, ...prev]);
  };

  const updateItem = useCallback((id: string, field: keyof InventoryDifferenceItem, value: string) => {
    let finalValue = value;
    if (field === 'comments' && value.length > 0) finalValue = value.charAt(0).toUpperCase() + value.slice(1);
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: finalValue } : item));
  }, []);

  const deleteItem = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), []);

  const handleUnitNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) { setUnitNumber(""); return; }
    const num = parseInt(val, 10);
    setUnitNumber(num < 10 ? `0${num}` : num.toString());
  };

  const formatSalesInput = (val: string) => {
    if (!val) return "";
    const parts = val.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleSalesValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) setSalesValue(rawValue);
  };

  const currentCurrency = CURRENCIES[currency];
  const format = (val: number) => {
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${val < 0 ? '-' : ''}${currentCurrency.symbol}${formatted}`;
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
          <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-3 w-fit mx-auto">
            <ClipboardList className="h-5 w-5 text-slate-50" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Módulo Activo</p>
              <p className="text-xs font-bold text-slate-700">DIFERENCIAS EN INVENTARIO</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Store className="h-3 w-3" />Marca</Label>
                <Select value={unitBrand} onValueChange={setUnitBrand}>
                  <SelectTrigger className="h-10 font-bold bg-white border-slate-200"><SelectValue placeholder="Marca" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza Hut">Pizza Hut</SelectItem>
                    <SelectItem value="KFC">KFC</SelectItem>
                    <SelectItem value="Dennys">Dennys</SelectItem>
                    <SelectItem value="China Wok">China Wok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash className="h-3 w-3" />Unidad</Label>
                <Input type="text" placeholder="Ej. 10" value={unitNumber} onChange={handleUnitNumberChange} className="h-10 font-bold bg-white border-slate-200 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CircleDollarSign className="h-3 w-3" />Venta Total</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{currentCurrency.symbol}</span>
                  <Input type="text" inputMode="decimal" placeholder="0.00" value={formatSalesInput(salesValue)} onChange={handleSalesValueChange} className="h-10 font-bold bg-white border-slate-200 pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CircleDollarSign className="h-3 w-3" />Moneda</Label>
                <Select value={currency} onValueChange={(val: CurrencyCode) => setCurrency(val)}>
                  <SelectTrigger className="h-10 font-bold bg-white border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCIES).map((c) => (<SelectItem key={c.code} value={c.code}>{c.symbol} - {c.code}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PRODUCTOS CON DIFERENCIA</p>
                  <h3 className="text-xl font-black text-slate-900 tabular-nums leading-none">{stats.totalItems}</h3>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg"><Package className="h-4 w-4 text-white" /></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-blue-100 border shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">TOTAL NO INGRESADO</p>
                  <h3 className="text-xl font-black text-blue-900 tabular-nums leading-none">{format(stats.positiveImpact)}</h3>
                </div>
                <div className="bg-blue-600 p-2 rounded-lg"><CircleDollarSign className="h-4 w-4 text-white" /></div>
              </CardContent>
            </Card>
            <Card className="bg-white border-emerald-100 border shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">% IMPACTO S/VENTA</p>
                  <h3 className="text-xl font-black text-emerald-900 tabular-nums leading-none">{stats.impactPercentage.toFixed(2)}%</h3>
                </div>
                <div className="bg-emerald-600 p-2 rounded-lg"><Percent className="h-4 w-4 text-white" /></div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white">
            <div className="bg-slate-700 p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /><h3 className="font-black uppercase tracking-tight text-xs">INGRESO DE PRODUCTOS</h3></div>
              <Button onClick={handleAddItem} size="sm" variant="secondary" className="h-7 text-[10px] font-black uppercase"><Plus className="h-3 w-3 mr-1" /> AÑADIR PRODUCTO</Button>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 border-b">
                  <TableRow className="h-10">
                    <TableHead className="font-black text-[10px] uppercase text-left pl-4">PRODUCTO</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-center w-28">MEDIDA</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-center w-28 border-x">FÍSICO</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-center w-28">SISTEMA</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-center w-28 border-x">PRECIO UNIT.</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-left">COMENTARIOS</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (<InventoryDifferenceRow key={item.id} item={item} onUpdate={updateItem} onDelete={deleteItem} />))}
                  {items.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="h-32 text-center"><div className="flex flex-col items-center gap-2 text-slate-300"><PlusCircle className="h-8 w-8" /><p className="font-black uppercase text-[10px] tracking-widest">Haga clic en 'Añadir Producto' para comenzar</p></div></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-center pb-12">
            <div className="max-w-md w-full">
              <DifferenceReportDialog items={items} unitBrand={unitBrand} unitNumber={unitNumber} currencyCode={currency} salesValue={salesValue} />
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
