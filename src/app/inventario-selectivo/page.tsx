"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { InventoryItem, InventoryCategory, CurrencyCode, CURRENCIES } from "@/types";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
  PackageSearch,
  Trash2,
  AlertTriangle,
  Target,
  FlaskConical,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Calculator,
  Minus,
  CircleDollarSign,
  Save,
  Loader2,
  Download
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InventoryReportDialog } from "@/components/petty-cash/InventoryReportDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

const THEME_RED = "#ec5f40";
const TEMPLATE_VERSION = "2.1"; 

const BRAND_TEMPLATES: Record<string, { product: string; category: InventoryCategory; unit: string; price: string }[]> = {
  "Pizza Hut": [
    { product: "PEPSI MEDIO LITRO", category: "materia_prima", unit: "UNIDAD", price: "11.14" },
    { product: "BOTES DE AGUA", category: "materia_prima", unit: "UNIDAD", price: "9.31" },
    { product: "ACEITE EN SPRAY", category: "materia_prima", unit: "UNIDAD", price: "145.24" },
    { product: "CAJAS 14 N/C", category: "materia_prima", unit: "UNIDAD", price: "7.28" },
    { product: "CAJAS PIZZA MIA", category: "materia_prima", unit: "UNIDAD", price: "7.15" },
    { product: "ENSALADA DE PAPA", category: "materia_prima", unit: "LIBRA", price: "52.48" },
    { product: "PEPPERONI", category: "materia_prima", unit: "LIBRA", price: "95.12" },
    { product: "ALITAS", category: "materia_prima", unit: "LIBRA", price: "118.45" },
    { product: "QUESO MOZZARELLA", category: "materia_prima", unit: "LIBRA", price: "72.30" },
    { product: "QUESO STUFFED CRUST", category: "materia_prima", unit: "LIBRA", price: "75.14" },
    { product: "POLLO P/PECHURRICAS", category: "materia_prima", unit: "LIBRA", price: "102.18" },
    { product: "POSTRE CHEESECAKE", category: "materia_prima", unit: "UNIDAD", price: "38.50" },
    { product: "EXTRA CLEAN", category: "quimicos", unit: "GALONES", price: "385.12" },
    { product: "STRIPPER", category: "quimicos", unit: "GALONES", price: "412.45" },
    { product: "DETERGENTE SINK", category: "quimicos", unit: "UNIDAD", price: "9.25" },
    { product: "SANITIZANTE SINK", category: "quimicos", unit: "UNIDAD", price: "9.18" },
  ],
  "KFC": [
    { product: "PEPSI MEDIO LITRO", category: "materia_prima", unit: "UNIDAD", price: "11.14" },
    { product: "BOTES DE AGUA", category: "materia_prima", unit: "UNIDAD", price: "9.31" },
    { product: "ACEITE P/FREIR", category: "materia_prima", unit: "LIBRA", price: "32.18" },
    { product: "CAJAS P/NUGGETS", category: "materia_prima", unit: "UNIDAD", price: "3.25" },
    { product: "CAJAS DIPPING BOX", category: "materia_prima", unit: "UNIDAD", price: "9.82" },
    { product: "POLLO CRISPY", category: "materia_prima", unit: "LIBRA", price: "45.12" },
    { product: "POLLO ORIGINAL", category: "materia_prima", unit: "LIBRA", price: "46.28" },
    { product: "POLLO PICANTE", category: "materia_prima", unit: "LIBRA", price: "47.15" },
    { product: "FILETE BIG CRUNCH", category: "materia_prima", unit: "LIBRA", price: "68.42" },
    { product: "NUGGETS", category: "materia_prima", unit: "LIBRA", price: "98.15" },
    { product: "POSTRE PIE DE MORA", category: "materia_prima", unit: "UNIDAD", price: "12.40" },
    { product: "PAPAS CONGELADAS", category: "materia_prima", unit: "LIBRA", price: "24.18" },
    { product: "EXTRA CLEAN PLUS", category: "quimicos", unit: "GALONES", price: "512.48" },
    { product: "BLITZ", category: "quimicos", unit: "GALONES", price: "395.12" },
    { product: "DETERGENTE SINK", category: "quimicos", unit: "UNIDAD", price: "9.25" },
    { product: "SANITIZANTE SINK", category: "quimicos", unit: "UNIDAD", price: "9.18" },
  ],
  "Dennys": [
    { product: "PEPSI MEDIO LITRO", category: "materia_prima", unit: "UNIDAD", price: "11.14" },
    { product: "BOTES DE AGUA", category: "materia_prima", unit: "UNIDAD", price: "9.31" },
    { product: "EMPAQUE 8X8\"(CLAMSHELL)", category: "materia_prima", unit: "UNIDAD", price: "5.18" },
    { product: "LECHE DESLACTOSADA", category: "materia_prima", unit: "UNIDAD", price: "42.15" },
    { product: "LECHE CONDENSADA", category: "materia_prima", unit: "UNIDAD", price: "58.42" },
    { product: "JARABE CHOCOLATE", category: "materia_prima", unit: "UNIDAD", price: "198.15" },
    { product: "FRESAS", category: "materia_prima", unit: "LIBRA", price: "68.42" },
    { product: "LOMO DE RES", category: "materia_prima", unit: "LIBRA", price: "185.12" },
    { product: "ARANDANOS AZULES", category: "materia_prima", unit: "LIBRA", price: "82.15" },
    { product: "CAMARON CRUDO", category: "materia_prima", unit: "LIBRA", price: "142.30" },
    { product: "PAN CIABATTA", category: "materia_prima", unit: "UNIDAD", price: "8.45" },
    { product: "PAN INTEGRAL HAMBURGUESA", category: "materia_prima", unit: "UNIDAD", price: "16.28" },
    { product: "EXTRA CLEAN", category: "quimicos", unit: "GALONES", price: "385.12" },
    { product: "FAST DRY", category: "quimicos", unit: "GALONES", price: "512.48" },
    { product: "BLITZ", category: "quimicos", unit: "GALONES", price: "395.12" },
    { product: "AMONIO SANIQUAT", category: "quimicos", unit: "GALONES", price: "485.12" },
  ],
  "China Wok": [
    { product: "PEPSI MEDIO LITRO", category: "materia_prima", unit: "UNIDAD", price: "11.14" },
    { product: "BOTES DE AGUA", category: "materia_prima", unit: "UNIDAD", price: "9.31" },
    { product: "ARROZ BLANCO", category: "materia_prima", unit: "LIBRA", price: "15.42" },
    { product: "EMPAQUE BOWL", category: "materia_prima", unit: "UNIDAD", price: "11.28" },
    { product: "PANECILLOS", category: "materia_prima", unit: "UNIDAD", price: "2.15" },
    { product: "REPOLLO P/CHOW MEIN", category: "materia_prima", unit: "LIBRA", price: "16.42" },
    { product: "HUEVOS CRUDOS", category: "materia_prima", unit: "UNIDAD", price: "3.50" },
    { product: "NUGGETS DE POLLO", category: "materia_prima", unit: "LIBRA", price: "85.12" },
    { product: "LOMO DE RES", category: "materia_prima", unit: "LIBRA", price: "138.45" },
    { product: "PAPAS CONGELADAS", category: "materia_prima", unit: "LIBRA", price: "24.18" },
    { product: "CAMARONES CON COLA", category: "materia_prima", unit: "LIBRA", price: "168.42" },
    { product: "PLATANO MADURO", category: "materia_prima", unit: "LIBRA", price: "32.18" },
    { product: "EXTRA CLEAN", category: "quimicos", unit: "GALONES", price: "385.12" },
    { product: "STRIPPER", category: "quimicos", unit: "GALONES", price: "412.45" },
    { product: "DETERGENTE SINK", category: "quimicos", unit: "UNIDAD", price: "9.25" },
    { product: "SANITIZANTE SINK", category: "quimicos", unit: "UNIDAD", price: "9.18" },
  ]
};

const InventoryRow = memo(({ 
  item, 
  onUpdate, 
  onDelete
}: { 
  item: InventoryItem; 
  onUpdate: (id: string, field: keyof InventoryItem, value: string) => void;
  onDelete: (id: string) => void;
}) => {
  const diff = (parseFloat(item.audited) || 0) - (parseFloat(item.system) || 0);
  const isWhole = item.unit === 'UNIDAD';

  return (
    <TableRow className="h-14 border-b group transition-none">
      <TableCell className="pl-4 py-1 min-w-[140px]">
        <Input 
          value={item.product} 
          onChange={(e) => onUpdate(item.id, 'product', e.target.value.toUpperCase())}
          className="h-9 text-[11px] font-bold bg-transparent border-none shadow-none focus-visible:ring-0 uppercase placeholder:text-slate-300 transition-none"
          placeholder="PRODUCTO..."
        />
      </TableCell>
      <TableCell className="p-1 min-w-[90px]">
        <Select value={item.unit} onValueChange={(val) => onUpdate(item.id, 'unit', val)}>
          <SelectTrigger className="h-9 text-[10px] text-center font-black bg-slate-50/50 border-none shadow-none focus:ring-0 transition-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNIDAD">UNIDAD</SelectItem>
            <SelectItem value="LIBRA">LIBRA</SelectItem>
            <SelectItem value="GALONES">GALONES</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      
      <TableCell className="p-1 bg-red-50/30 min-w-[110px]">
        <div className="flex items-center justify-center">
          <div className="h-10 w-full flex items-center justify-center text-[11px] font-black text-[#1e3a8a] bg-white border border-red-100 rounded-md shadow-sm">
            {parseFloat(item.audited || "0").toFixed(1)}
          </div>
        </div>
      </TableCell>
      
      <TableCell className="p-1 min-w-[80px]">
        <Input 
          type="number"
          inputMode="decimal"
          step={isWhole ? "1" : "0.01"}
          value={item.system} 
          onChange={(e) => onUpdate(item.id, 'system', e.target.value)}
          className="h-9 text-[10px] text-center font-black bg-slate-50/50 text-slate-400 transition-none"
          placeholder="0.0"
        />
      </TableCell>
      <TableCell className={cn(
        "p-1 text-[11px] text-center font-black min-w-[80px]",
        diff > 0.001 ? "text-blue-600" : diff < -0.001 ? "text-red-500" : "text-[#059669]"
      )}>
        {diff < -0.001 ? '-' : ''}{isWhole ? Math.abs(Math.round(diff)) : Math.abs(diff).toFixed(1)}
      </TableCell>
      <TableCell className="p-1 border-l min-w-[80px]">
        <div className="relative">
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300">L</span>
          <Input 
            type="number"
            inputMode="decimal"
            step="0.01"
            value={item.price} 
            onChange={(e) => onUpdate(item.id, 'price', e.target.value)}
            className="h-9 pl-4 text-[10px] text-center font-black bg-slate-50/50 transition-none"
            placeholder="0.00"
          />
        </div>
      </TableCell>
      <TableCell className="p-1 w-10">
        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8 text-slate-300 hover:text-red-500 transition-none">
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});
InventoryRow.displayName = "InventoryRow";

export default function InventarioSelectivoPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [currency, setCurrency] = useState<CurrencyCode>('HNL');
  const [unitBrand, setUnitBrand] = useState<string>("Pizza Hut");
  const [unitNumber, setUnitNumber] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [isGeneralCounterOpen, setIsGeneralCounterOpen] = useState(false);
  const [counterCategory, setCounterCategory] = useState<InventoryCategory | null>(null);

  const loadFactoryTemplate = useCallback((brand: string) => {
    const template = BRAND_TEMPLATES[brand] || BRAND_TEMPLATES["Pizza Hut"];
    return template.map((t, idx) => ({
      id: `item-${brand}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      category: t.category,
      product: t.product,
      unit: t.unit,
      audited: "0",
      system: "",
      price: t.price || ""
    }));
  }, []);

  const initBrandData = useCallback(async (brand: string) => {
    const currentVersion = localStorage.getItem("contraloria_gc_template_v");
    if (currentVersion !== TEMPLATE_VERSION) {
      localStorage.setItem("contraloria_gc_template_v", TEMPLATE_VERSION);
      Object.keys(localStorage).forEach(key => {
        if (key.includes("contraloria_gc_inventory_session_") || key.includes("contraloria_gc_template_")) {
          localStorage.removeItem(key);
        }
      });
      setItems(loadFactoryTemplate(brand));
      return;
    }

    const savedSession = localStorage.getItem(`contraloria_gc_inventory_session_${brand}`);
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        if (data.items && data.items.length > 0) {
          setItems(data.items);
          setUnitNumber(data.unitNumber || "");
          return;
        }
      } catch (e) { console.error(e); }
    }

    const localTemplate = localStorage.getItem(`contraloria_gc_template_${brand}`);
    if (localTemplate) {
      try {
        const tData = JSON.parse(localTemplate);
        setItems(tData.map((t: any, idx: number) => ({
          id: `item-${brand}-${Date.now()}-${idx}`,
          category: t.category,
          product: t.product,
          unit: t.unit,
          audited: "0",
          system: "",
          price: t.price || ""
        })));
        return;
      } catch (e) { console.error(e); }
    }

    setItems(loadFactoryTemplate(brand));
  }, [loadFactoryTemplate]);

  useEffect(() => {
    const lastBrand = localStorage.getItem("contraloria_gc_last_brand") || "Pizza Hut";
    setUnitBrand(lastBrand);
    initBrandData(lastBrand);
    setIsMounted(true);
  }, [initBrandData]);

  useEffect(() => {
    if (!auth?.currentUser || !db || !isMounted) return;

    const syncFromCloud = async () => {
      try {
        const userId = auth.currentUser!.email!.replace(/[^a-zA-Z0-9]/g, '_');
        const docRef = doc(db, 'users', userId, 'inventoryTemplates', unitBrand);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.items && cloudData.items.length > 0) {
            const currentSession = localStorage.getItem(`contraloria_gc_inventory_session_${unitBrand}`);
            if (!currentSession) {
              setItems(cloudData.items.map((i: any, idx: number) => ({
                ...i,
                id: i.id || `cloud-${idx}-${Date.now()}`,
                audited: i.audited || "0",
                system: i.system || "",
                price: i.price || ""
              })));
            }
          }
        }
      } catch (e) { console.error("Error syncing from cloud", e); }
    };
    syncFromCloud();
  }, [auth?.currentUser, db, unitBrand, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const data = { items, unitNumber };
    localStorage.setItem(`contraloria_gc_inventory_session_${unitBrand}`, JSON.stringify(data));
    localStorage.setItem("contraloria_gc_last_brand", unitBrand);
  }, [items, unitNumber, unitBrand, isMounted]);

  const handleBrandChange = (brand: string) => {
    setUnitBrand(brand);
    initBrandData(brand);
  };

  const handleSaveAsDefault = async () => {
    setIsSyncing(true);
    const templateData = items.map(i => ({
      product: i.product,
      category: i.category,
      unit: i.unit,
      price: i.price
    }));

    localStorage.setItem(`contraloria_gc_template_${unitBrand}`, JSON.stringify(templateData));

    if (auth?.currentUser && db) {
      try {
        const userId = auth.currentUser.email!.replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(doc(db, 'users', userId, 'inventoryTemplates', unitBrand), {
          brand: unitBrand,
          items: templateData,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        toast({ title: "Guardado en la Nube", description: "Tus productos y precios están sincronizados." });
      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error de Nube", description: "Se guardó localmente pero no en la nube." });
      }
    } else {
      toast({ title: "Guardado Local", description: "Inicia sesión para sincronizar esta plantilla." });
    }
    setIsSyncing(false);
  };

  const stats = useMemo(() => {
    const activeItems = items.filter(i => i.product.trim() !== "");
    const total = activeItems.length;
    let withDiff = 0;
    let positiveValue = 0;
    let negativeValue = 0;

    activeItems.forEach(i => {
      const audited = parseFloat(i.audited) || 0;
      const system = parseFloat(i.system) || 0;
      const price = parseFloat(i.price) || 0;
      const d = audited - system;
      if (Math.abs(d) > 0.001) {
        withDiff++;
        if (d > 0) positiveValue += d * price;
        else negativeValue += Math.abs(d) * price;
      }
    });

    const efficiency = total > 0 ? ((total - withDiff) / total) * 100 : 100;
    return { total, withDiff, efficiency: Math.round(efficiency), positiveValue, negativeValue };
  }, [items]);

  const handleAddItem = (category: InventoryCategory) => {
    const newItem: InventoryItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: category,
      product: "",
      unit: "UNIDAD",
      audited: "0",
      system: "",
      price: ""
    };
    setItems(prev => [newItem, ...prev]);
  };

  const updateItem = useCallback((id: string, field: keyof InventoryItem, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (['c1', 'c2', 'c3', 'c4', 'c5'].includes(field)) {
          const sum = (parseFloat(updatedItem.c1 || "0") || 0) + 
                      (parseFloat(updatedItem.c2 || "0") || 0) + 
                      (parseFloat(updatedItem.c3 || "0") || 0) +
                      (parseFloat(updatedItem.c4 || "0") || 0) +
                      (parseFloat(updatedItem.c5 || "0") || 0);
          updatedItem.audited = sum.toString();
        }
        return updatedItem;
      }
      return item;
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const currentCurrency = CURRENCIES[currency];
  const formatValue = (val: number) => {
    return `${currentCurrency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderInventoryTable = (category: InventoryCategory, title: string, icon: any) => {
    const categoryItems = items.filter(i => i.category === category);
    const Icon = icon;
    return (
      <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white mb-6 transition-none">
        <div style={{ backgroundColor: THEME_RED }} className="p-3 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <h3 className="font-black uppercase tracking-tight text-[11px] sm:text-xs">{title}</h3>
          </div>
          <Button 
            onClick={() => handleAddItem(category)} 
            size="sm" 
            variant="secondary" 
            className="h-8 w-full sm:w-auto text-[10px] font-black uppercase transition-none"
          >
            <Plus className="h-3 w-3 mr-1" /> AÑADIR PRODUCTO
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-slate-50 border-b">
                <TableRow className="h-10 transition-none text-nowrap">
                  <TableHead className="font-black text-[10px] uppercase text-left pl-4 min-w-[140px]">PRODUCTO</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-center min-w-[90px]">MEDIDA</TableHead>
                  <TableHead style={{ color: "#1e3a8a" }} className="font-black text-[10px] uppercase text-center min-w-[110px] bg-red-50/50">
                    <div className="flex items-center justify-center gap-1">
                      AUDITADO
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full text-blue-700 hover:bg-blue-100 transition-none"
                        onClick={() => { setCounterCategory(category); setIsGeneralCounterOpen(true); }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-center min-w-[80px]">SISTEMA</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-center min-w-[80px]">DIFERENCIA</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-center min-w-[80px] border-l">PRECIO U.</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryItems.map((item) => (
                  <InventoryRow 
                    key={item.id} 
                    item={item} 
                    onUpdate={updateItem} 
                    onDelete={deleteItem}
                  />
                ))}
                {categoryItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-1 text-slate-300">
                        <PlusCircle className="h-8 w-8" />
                        <p className="font-black uppercase text-[9px] tracking-widest">Añadir productos desde el botón superior</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 container mx-auto py-6 sm:py-8 px-4 max-w-6xl">
        <div className="mb-6 sm:mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shadow-sm">
              <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-[900] text-slate-800 tracking-tighter uppercase leading-none whitespace-nowrap">
              Contraloria <span className="text-primary">GC</span>
            </h2>
          </div>
          <Link href="/" prefetch={true} className="transition-none">
            <div className="inline-flex items-center gap-2 font-black text-muted-foreground hover:text-primary transition-none cursor-pointer group bg-white px-4 py-2 rounded-full border shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.2em]">MENÚ PRINCIPAL</span>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-3 w-fit mx-auto transition-none">
            <PackageSearch style={{ color: THEME_RED }} className="h-5 w-5" />
            <div>
              <p style={{ color: THEME_RED }} className="text-[9px] font-black uppercase tracking-widest leading-none">Módulo Activo</p>
              <p style={{ color: THEME_RED }} className="text-xs font-bold">INVENTARIO SELECTIVO</p>
            </div>
          </div>

          <div className="bg-red-50 p-4 sm:p-5 rounded-xl shadow-sm border border-red-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Store className="h-3 w-3" /> Marca
                </Label>
                <Select value={unitBrand} onValueChange={handleBrandChange}>
                  <SelectTrigger className="h-10 font-bold bg-white border-red-200 transition-none">
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza Hut">Pizza Hut</SelectItem>
                    <SelectItem value="KFC">KFC</SelectItem>
                    <SelectItem value="Dennys">Dennys</SelectItem>
                    <SelectItem value="China Wok">China Wok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2 items-end">
                <Button 
                  onClick={() => {
                    if (confirm("¿Cargar la plantilla base oficial? Esto borrará tus cambios actuales.")) {
                      setItems(loadFactoryTemplate(unitBrand));
                    }
                  }}
                  variant="outline" 
                  size="sm" 
                  className="h-10 w-full font-black text-[10px] uppercase border-red-200 text-red-600 bg-white hover:bg-red-50 transition-none"
                >
                  <Download className="h-3 w-3 mr-1" /> CARGAR
                </Button>

                <Button 
                  onClick={handleSaveAsDefault}
                  disabled={isSyncing}
                  variant="outline" 
                  size="sm" 
                  className="h-10 w-full font-black text-[10px] uppercase border-blue-200 text-blue-600 bg-white hover:bg-blue-50 transition-none flex items-center justify-center gap-1"
                >
                  {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  GUARDAR
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="h-3 w-3" /> Unidad
                </Label>
                <input 
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej. 10"
                  value={unitNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (!val) { setUnitNumber(""); return; }
                    const num = parseInt(val, 10);
                    setUnitNumber(num < 10 ? `0${num}` : num.toString());
                  }}
                  className="flex h-10 w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CircleDollarSign className="h-3 w-3" /> Moneda
                </Label>
                <Select value={currency} onValueChange={(val: CurrencyCode) => setCurrency(val)}>
                  <SelectTrigger className="h-10 font-bold bg-white border-red-200 transition-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CURRENCIES).map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} - {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card className="p-3 bg-white border-none shadow-sm flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg shrink-0">
                <Target className="h-4 w-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">Items Totales</p>
                <p className="text-sm font-black text-slate-900 leading-none">{stats.total}</p>
              </div>
            </Card>
            <Card className="p-3 bg-white border-none shadow-sm flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-lg shrink-0">
                <AlertTriangle style={{ color: THEME_RED }} className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p style={{ color: THEME_RED }} className="text-[8px] font-black uppercase tracking-widest truncate">Con Diferencias</p>
                <p style={{ color: THEME_RED }} className="text-sm font-black leading-none">{stats.withDiff}</p>
              </div>
            </Card>
            <Card style={{ backgroundColor: THEME_RED }} className="p-3 border-none shadow-sm flex items-center gap-3 transition-none text-white col-span-2 sm:col-span-1">
              <div className="bg-white/20 p-2 rounded-lg shrink-0">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-80 truncate">Precisión</p>
                <p className="text-sm font-black leading-none">{stats.efficiency}%</p>
              </div>
            </Card>
            <Card className="p-3 bg-white border-blue-100 border shadow-sm flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shrink-0">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest truncate">Sobrante</p>
                <p className="text-sm font-black text-blue-900 leading-none">{formatValue(stats.positiveValue)}</p>
              </div>
            </Card>
            <Card className="p-3 bg-white border-red-100 border shadow-sm flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg shrink-0">
                <Minus className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest truncate">Faltante</p>
                <p className="text-sm font-black text-red-900 leading-none">{formatValue(stats.negativeValue)}</p>
              </div>
            </Card>
          </div>

          {renderInventoryTable("materia_prima", "MATERIA PRIMA", PackageSearch)}
          {renderInventoryTable("quimicos", "QUIMICOS", FlaskConical)}

          <div className="flex justify-center pb-12">
            <div className="max-w-md w-full">
              <InventoryReportDialog 
                items={items}
                unitBrand={unitBrand}
                unitNumber={unitNumber}
                currencyCode={currency}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] mt-auto">
        <p>2026 CONTRALORÍA GRUPO COMIDAS • CGC SISTEMA DE CONTROLES OPERATIVOS. LP</p>
      </footer>

      <Dialog open={isGeneralCounterOpen} onOpenChange={setIsGeneralCounterOpen}>
        <DialogContent className="max-w-[98vw] sm:max-w-4xl bg-white p-0 overflow-hidden rounded-[1.5rem] shadow-2xl border-none transition-none flex flex-col h-[90vh]">
          <DialogHeader className="bg-slate-900 p-5 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2.5 rounded-xl">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <DialogTitle className="font-black uppercase tracking-widest text-[11px]">Plantilla de Conteo General</DialogTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {counterCategory === 'materia_prima' ? 'MATERIA PRIMA' : 'QUIMICOS'}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 bg-slate-50/50">
            <div className="p-4 space-y-4">
              {items.filter(i => i.category === counterCategory).map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-[11px] uppercase text-slate-700">{item.product}</span>
                    <span className="text-[10px] font-bold text-slate-400">{item.unit}</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'c1', label: 'C1' },
                      { id: 'c2', label: 'C2' },
                      { id: 'c3', label: 'C3' },
                      { id: 'c4', label: 'C4' },
                      { id: 'c5', label: 'C5' },
                    ].map((c) => (
                      <div key={c.id} className="space-y-1">
                        <Label className="text-[8px] font-black text-slate-400 uppercase text-center block">{c.label}</Label>
                        <Input 
                          type="number" 
                          inputMode="decimal"
                          placeholder="0"
                          value={(item as any)[c.id] || ""}
                          onChange={(e) => updateItem(item.id, c.id as any, e.target.value)}
                          className="h-9 text-center font-black text-xs border-slate-200 focus-visible:ring-primary transition-none"
                        />
                      </div>
                    ))}
                    <div className="space-y-1">
                      <Label className="text-[8px] font-black text-primary uppercase text-center block">TOTAL</Label>
                      <div className="h-9 flex items-center justify-center bg-primary/5 border border-primary/20 rounded-md font-black text-primary text-xs">
                        {parseFloat(item.audited || "0").toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 bg-white border-t shrink-0">
            <Button 
              onClick={() => setIsGeneralCounterOpen(false)} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest h-12 rounded-xl transition-none"
            >
              FINALIZAR Y CONSOLIDAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
