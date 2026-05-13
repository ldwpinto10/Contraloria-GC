
"use client"

import { useState, useEffect, useMemo } from "react";
import { DispatchOrder } from "@/types";
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
  Timer,
  Trash2,
  PlusCircle,
  Clock,
  LayoutList,
  UtensilsCrossed,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DispatchReportDialog } from "@/components/petty-cash/DispatchReportDialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CHANNELS = [
  "Agregadores",
  "Comedor",
  "Llevar",
  "Kiosko Comedor",
  "Kiosko Llevar"
];

export default function TiemposDespachoPage() {
  const [unitBrand, setUnitBrand] = useState<string>("");
  const [unitNumber, setUnitNumber] = useState("");
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    localStorage.removeItem("contraloria_gc_dispatch_v1_reported");
    const saved = localStorage.getItem("contraloria_gc_dispatch_v1");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnitBrand(data.unitBrand || "");
        setUnitNumber(data.unitNumber || "");
        setOrders(data.orders || []);
      } catch (e) {
        console.error("Error cargando sesión previa", e);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const data = {
      unitBrand,
      unitNumber,
      orders
    };
    const timer = setTimeout(() => {
      localStorage.setItem("contraloria_gc_dispatch_v1", JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timer);
  }, [unitBrand, unitNumber, orders, isMounted]);

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => {
      const parts = (o.time || "").split(':');
      return parts.length === 3 && (o.orderNumber || "").trim() !== "" && o.time !== "00:00:00";
    });

    const totalOrders = orders.length;
    const totalCombos = orders.reduce((acc, o) => acc + (parseInt(o.quantity || "0") || 0), 0);

    let avgTime = "00:00:00";
    if (validOrders.length > 0) {
      const totalSeconds = validOrders.reduce((acc, order) => {
        const [h, m, s] = (order.time || "00:00:00").split(':').map(Number);
        return acc + (h * 3600) + (m * 60) + s;
      }, 0);

      const avgSeconds = Math.round(totalSeconds / validOrders.length);
      const h = Math.floor(avgSeconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((avgSeconds % 3600) / 60).toString().padStart(2, '0');
      const s = (avgSeconds % 60).toString().padStart(2, '0');
      avgTime = `${h}:${m}:${s}`;
    }

    return { totalOrders, totalCombos, averageTime: avgTime };
  }, [orders]);

  const handleAddOrder = () => {
    const newOrder: DispatchOrder = {
      id: Date.now().toString(),
      orderNumber: "",
      channel: "Comedor",
      combo: "",
      quantity: "",
      time: "00:00:00",
      observations: ""
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrder = (id: string, field: keyof DispatchOrder, value: string) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, [field]: value } : order));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const handleUnitNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      setUnitNumber("");
      return;
    }
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
          <div className="bg-[#062c24] px-4 py-2 rounded-lg border border-[#041d18] flex items-center gap-3 w-fit mx-auto text-white">
            <Clock className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest leading-none opacity-70">Módulo Activo</p>
              <p className="text-xs font-bold">TIEMPOS DE DESPACHO</p>
            </div>
          </div>

          <div className="bg-emerald-50 p-5 rounded-xl shadow-sm border border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Store className="h-3 w-3" />
                  Marca
                </Label>
                <Select value={unitBrand || ""} onValueChange={setUnitBrand}>
                  <SelectTrigger className="h-10 font-bold bg-white border-emerald-100">
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
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="h-3 w-3" />
                  Unidad
                </Label>
                <Input 
                  type="text"
                  placeholder="Ej. 10"
                  value={unitNumber || ""}
                  onChange={handleUnitNumberChange}
                  className="h-10 font-bold bg-white border-emerald-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden p-4 flex items-center gap-4">
              <div className="bg-[#062c24] p-3 rounded-lg">
                <LayoutList className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Órdenes Registradas</p>
                <h3 className="text-2xl font-black text-[#062c24] tabular-nums leading-none">
                  {stats.totalOrders}
                </h3>
              </div>
            </Card>

            <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden p-4 flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Combos</p>
                <h3 className="text-2xl font-black text-emerald-600 tabular-nums leading-none">
                  {stats.totalCombos}
                </h3>
              </div>
            </Card>

            <Card className="bg-[#062c24] border-none shadow-sm rounded-xl overflow-hidden p-4 flex items-center gap-4 text-white">
              <div className="bg-emerald-500 p-3 rounded-lg">
                <Timer className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Promedio de Tiempo</p>
                <h3 className="text-2xl font-black text-emerald-400 tabular-nums leading-none">
                  {stats.averageTime.slice(3)}
                </h3>
              </div>
            </Card>
          </div>

          <Card className="shadow-md border-none overflow-hidden rounded-xl bg-white">
            <div className="bg-[#062c24] p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-black uppercase tracking-tight text-xs">LISTADO DE ÓRDENES</h3>
              </div>
              <Button onClick={handleAddOrder} size="sm" variant="secondary" className="h-7 text-[10px] font-black uppercase">
                <Plus className="h-3 w-3 mr-1" /> AÑADIR ORDEN
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 border-b">
                    <TableRow className="h-10">
                      <TableHead className="font-black text-[10px] uppercase text-center w-14"># ORDEN</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-left pl-4 w-28 border-x-2 border-slate-200">CANAL</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center w-10 border-r-2 border-slate-200 text-slate-500">CANT</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-left pl-4 w-60">COMBO</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center w-20 border-x-2 border-slate-200">TIEMPO (M:S)</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-left pl-6">OBSERVACIONES</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="h-12 border-b group">
                        <TableCell className="p-1 w-14">
                          <Input 
                            value={order.orderNumber} 
                            onChange={(e) => updateOrder(order.id, 'orderNumber', e.target.value)}
                            className="h-8 text-[11px] font-bold text-center bg-slate-50/50"
                            placeholder="000"
                          />
                        </TableCell>
                        <TableCell className="p-1 border-x w-28">
                          <Select value={order.channel} onValueChange={(val) => updateOrder(order.id, 'channel', val)}>
                            <SelectTrigger className="h-8 text-[10px] font-black border-none shadow-none focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHANNELS.map(c => (
                                <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-1 border-r w-10">
                          <Input 
                            type="number"
                            value={order.quantity} 
                            onChange={(e) => updateOrder(order.id, 'quantity', e.target.value)}
                            className="h-8 text-[11px] text-center font-black bg-slate-50/50"
                            placeholder=""
                          />
                        </TableCell>
                        <TableCell className="p-1 w-60">
                          <Input 
                            value={order.combo} 
                            onChange={(e) => updateOrder(order.id, 'combo', e.target.value.toUpperCase())}
                            className="h-8 text-[11px] font-bold bg-transparent border-none shadow-none focus-visible:ring-0 uppercase whitespace-nowrap overflow-hidden text-ellipsis"
                            placeholder="NOMBRE DEL COMBO..."
                          />
                        </TableCell>
                        <TableCell className="p-1 border-x w-20">
                          <Input 
                            value={order.time} 
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = e.target.value;
                              const raw = val.replace(/\D/g, '');
                              const digits = raw.slice(-6);
                              const padded = digits.padStart(6, '0');
                              const formatted = `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`;
                              updateOrder(order.id, 'time', formatted);
                            }}
                            className="h-8 text-[11px] text-center font-black bg-slate-50/50"
                            placeholder="00:00:00"
                          />
                        </TableCell>
                        <TableCell className="p-1 pl-6">
                          <Input 
                            value={order.observations} 
                            onChange={(e) => updateOrder(order.id, 'observations', e.target.value)}
                            className="h-8 text-[10px] font-bold bg-transparent border-none shadow-none focus-visible:ring-0 text-slate-500 italic whitespace-nowrap overflow-hidden text-ellipsis"
                            placeholder="ANOTACIONES BREVES..."
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Button variant="ghost" size="icon" onClick={() => deleteOrder(order.id)} className="h-7 w-7 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-300">
                            <PlusCircle className="h-8 w-8" />
                            <p className="font-black uppercase text-[10px] tracking-widest">Haga clic en 'Añadir Orden' para comenzar</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pb-12">
            <div className="max-w-md w-full">
              <DispatchReportDialog 
                orders={orders}
                unitBrand={unitBrand}
                unitNumber={unitNumber}
                averageTime={stats.averageTime}
                totalCombos={stats.totalCombos}
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
