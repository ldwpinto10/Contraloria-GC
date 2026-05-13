"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { PizzaEntry, PizzaIngredientFactor, CurrencyCode, CURRENCIES } from "@/types";
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
  Pizza as PizzaIcon,
  ShieldCheck,
  Calculator,
  Scale,
  Package,
  ListChecks
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PizzaConverterReportDialog } from "@/components/petty-cash/PizzaConverterReportDialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PIZZA_RECIPES: Record<string, PizzaIngredientFactor[]> = {
  "PIZZA MIA PEPPERONI": [
    { name: "HARINA", factor: 0.7572, unit: "LB" },
    { name: "ACEITE", factor: 0.0075, unit: "LB" },
    { name: "MEZCLA YGB", factor: 0.0682, unit: "UN" },
    { name: "QUESO MOZZARELLA", factor: 0.3125, unit: "LB" },
    { name: "QUESO HILO", factor: 0.5, unit: "LB" },
    { name: "SALSA PIZZA", factor: 0.20, unit: "LB" },
    { name: "PEPPERONI", factor: 0.0990, unit: "LB" },
    { name: "CAJA PIZZA MIA", factor: 1.0, unit: "UN" }
  ],
  "PIZZA HC G PEPPERONI": [
    { name: "HARINA", factor: 0.7572, unit: "LB" },
    { name: "ACEITE", factor: 0.0075, unit: "LB" },
    { name: "MEZCLA YGB", factor: 0.0682, unit: "UN" },
    { name: "QUESO MOZZARELLA", factor: 0.37125, unit: "LB" },
    { name: "QUESO HILO", factor: 0.5, unit: "LB" },
    { name: "SALSA PIZZA", factor: 0.20, unit: "LB" },
    { name: "PEPPERONI", factor: 0.14025, unit: "LB" },
    { name: "CAJA 14", factor: 1.0, unit: "UN" }
  ],
  "PIZZA PP PEPPERONI": [
    { name: "HARINA", factor: 0.8554, unit: "LB" },
    { name: "ACEITE", factor: 0.1025, unit: "LB" },
    { name: "MEZCLA YGB", factor: 0.0770, unit: "UN" },
    { name: "QUESO MOZZARELLA", factor: 0.53563, unit: "LB" },
    { name: "QUESO HILO", factor: 0.5, unit: "LB" },
    { name: "SALSA PIZZA", factor: 0.20, unit: "LB" },
    { name: "PEPPERONI", factor: 0.1980, unit: "LB" },
    { name: "CAJA 14", factor: 1.0, unit: "UN" }
  ]
};

const INITIAL_PIZZAS = Object.keys(PIZZA_RECIPES);

export default function ConvertidorPizzasPage() {
  const [unitBrand, setUnitBrand] = useState<string>("Pizza Hut");
  const [unitNumber, setUnitNumber] = useState("");
  const [entries, setEntries] = useState<PizzaEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("contraloria_gc_pizzas_v12");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnitBrand(data.unitBrand || "Pizza Hut");
        setUnitNumber(data.unitNumber || "");
        setEntries(data.entries || INITIAL_PIZZAS.map((p, i) => ({ id: i.toString(), product: p, quantity: "" })));
      } catch (e) { console.error(e); }
    } else {
      setEntries(INITIAL_PIZZAS.map((p, i) => ({ id: i.toString(), product: p, quantity: "" })));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const data = { unitBrand, unitNumber, entries };
    localStorage.setItem("contraloria_gc_pizzas_v12", JSON.stringify(data));
  }, [unitBrand, unitNumber, entries, isMounted]);

  const updateEntry = (id: string, field: keyof PizzaEntry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAddCustom = () => {
    const newEntry: PizzaEntry = {
      id: Date.now().toString(),
      product: "NUEVA PIZZA",
      quantity: ""
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const deleteEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const ingredientsPerPizza = useMemo(() => {
    return entries
      .filter(e => (parseFloat(e.quantity) || 0) > 0)
      .map(entry => {
        const qty = parseFloat(entry.quantity) || 0;
        const recipe = PIZZA_RECIPES[entry.product] || [];
        
        const calculatedIngredients = recipe.map(ing => ({
          name: ing.name,
          amount: ing.factor * qty,
          unit: ing.unit
        }));

        return {
          id: entry.id,
          product: entry.product,
          quantity: qty,
          ingredients: calculatedIngredients
        };
      });
  }, [entries]);

  const consolidatedSummary = useMemo(() => {
    const summary: Record<string, { unit: string; total: number; breakdown: Record<string, number> }> = {};
    const productNames = ingredientsPerPizza.map(p => p.product);

    ingredientsPerPizza.forEach(group => {
      group.ingredients.forEach(ing => {
        if (!summary[ing.name]) {
          summary[ing.name] = { unit: ing.unit, total: 0, breakdown: {} };
        }
        summary[ing.name].total += ing.amount;
        summary[ing.name].breakdown[group.product] = (summary[ing.name].breakdown[group.product] || 0) + ing.amount;
      });
    });

    return { summary, productNames };
  }, [ingredientsPerPizza]);

  const totalPizzas = useMemo(() => {
    return entries.reduce((acc, e) => acc + (parseFloat(e.quantity) || 0), 0);
  }, [entries]);

  if (!isMounted) return null;

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
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-3 w-fit mx-auto">
            <Scale className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-none">Módulo Activo</p>
              <p className="text-xs font-bold text-red-700 uppercase tracking-tight">CONSOLIDADO DE PIZZAS PREPARADAS</p>
            </div>
          </div>

          <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5"><Store className="h-3 w-3" />Marca</Label>
                <Select value={unitBrand} onValueChange={setUnitBrand}>
                  <SelectTrigger className="h-10 font-bold bg-white border-red-100"><SelectValue placeholder="Marca" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza Hut">Pizza Hut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5"><Hash className="h-3 w-3" />Unidad</Label>
                <input 
                  type="text" 
                  placeholder="Ej. 60" 
                  value={unitNumber} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (!val) { setUnitNumber(""); return; }
                    const num = parseInt(val, 10);
                    setUnitNumber(num < 10 ? `0${num}` : num.toString());
                  }} 
                  className="flex h-10 w-full rounded-md border border-red-100 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white h-fit">
              <div className="bg-red-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <h3 className="font-black uppercase tracking-tight text-xs">Pizzas para Convertir</h3>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded text-[10px] font-bold">
                  TOTAL: {totalPizzas.toFixed(2)}
                </div>
              </div>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow className="h-10">
                      <TableHead className="font-black text-[10px] uppercase text-left pl-6">PRODUCTO</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center w-32 border-l">CANTIDAD</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id} className="h-12 border-b group">
                        <TableCell className="pl-6">
                           <Input 
                            value={entry.product} 
                            onChange={(e) => updateEntry(entry.id, 'product', e.target.value.toUpperCase())}
                            className="h-8 text-[11px] font-black border-none shadow-none focus-visible:ring-0 bg-transparent uppercase transition-none"
                          />
                        </TableCell>
                        <TableCell className="p-1 border-l">
                          <input 
                            type="number" 
                            value={entry.quantity} 
                            onChange={(e) => updateEntry(entry.id, 'quantity', e.target.value)}
                            className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-center font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} className="h-7 w-7 text-slate-300 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 border-t">
                   <Button onClick={handleAddCustom} variant="outline" className="w-full h-10 font-black text-[10px] uppercase gap-2 border-red-200 text-red-600">
                      <Plus className="h-3 w-3" /> AÑADIR OTRA PIZZA
                   </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white h-fit">
                <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-red-500" />
                    <h3 className="font-black uppercase tracking-tight text-xs text-red-500">Insumos por Variedad</h3>
                  </div>
                </div>
                <CardContent className="p-0">
                  {ingredientsPerPizza.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                      Ingresa cantidades para ver el desglose
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {ingredientsPerPizza.map((group) => (
                        <div key={group.id} className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-red-50 p-1 rounded">
                              <PizzaIcon className="h-3.5 w-3.5 text-red-600" />
                            </div>
                            <span className="text-[11px] font-black uppercase text-slate-900">{group.product}</span>
                            <span className="text-[10px] font-bold text-slate-400">({group.quantity.toFixed(2)} UN)</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {group.ingredients.map((ing, idx) => (
                              <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col gap-0.5">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                  {ing.name}
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xs font-black text-red-600">{ing.amount.toFixed(4)}</span>
                                  <span className="text-[8px] font-bold text-slate-500">{ing.unit}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
            </Card>
          </div>

          {ingredientsPerPizza.length > 0 && (
            <Card className="shadow-lg border-none overflow-hidden rounded-xl bg-white mt-8">
              <div className="bg-red-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  <h3 className="font-black uppercase tracking-tight text-sm text-white">RESUMEN CONSOLIDADO DE PIZZAS</h3>
                </div>
              </div>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase text-left pl-6 border-r">INGREDIENTE</TableHead>
                      <TableHead className="font-black text-[11px] uppercase text-center bg-red-50 text-red-600 border-r w-28">TOTAL</TableHead>
                      {consolidatedSummary.productNames.map(name => (
                        <TableHead key={name} className="font-black text-[10px] uppercase text-center border-r">
                          {name.replace("PIZZA ", "")}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(consolidatedSummary.summary).map(([ingName, data]) => (
                      <TableRow key={ingName} className="h-12 border-b">
                        <TableCell className="pl-6 font-black text-[11px] uppercase border-r">{ingName} ({data.unit})</TableCell>
                        <TableCell className="text-center font-black text-[13px] bg-red-50/30 text-red-600 border-r">
                          {data.total.toFixed(4)}
                        </TableCell>
                        {consolidatedSummary.productNames.map(pName => (
                          <TableCell key={pName} className="text-center font-bold text-[11px] text-slate-600 border-r">
                            {data.breakdown[pName] ? data.breakdown[pName].toFixed(4) : '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center pb-12 pt-4">
            <div className="max-w-md w-full">
              <PizzaConverterReportDialog 
                entries={entries} 
                ingredientsPerPizza={ingredientsPerPizza}
                consolidatedSummary={consolidatedSummary}
                unitBrand={unitBrand} 
                unitNumber={unitNumber} 
              />
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