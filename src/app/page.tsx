"use client"

import { useState, useEffect } from "react";
import { 
  Banknote, 
  ArrowRight, 
  ClipboardList, 
  PackageSearch, 
  CircleDollarSign,
  Clock,
  Handshake,
  ShieldCheck,
  LayoutDashboard,
  Pizza
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modules = [
    {
      id: "fondos",
      title: "FONDOS ASIGNADOS",
      description: "Cuadre de fondo para cambio y fondo para caja chica.",
      href: "/fondos-asignados",
      icon: Banknote,
      borderColor: "border-primary/30",
      hoverBorder: "hover:border-primary",
      bgColor: "bg-primary/5",
      iconBg: "bg-primary",
      textColor: "text-primary"
    },
    {
      id: "arqueos",
      title: "CUADRE DE ARQUEOS SD",
      description: "Cuadre de arqueos en físico, reporte sistema vs depositado.",
      href: "/cuadre-arqueos",
      icon: CircleDollarSign,
      borderColor: "border-orange-500/30",
      hoverBorder: "hover:border-orange-500",
      bgColor: "bg-orange-500/5",
      iconBg: "bg-orange-500",
      textColor: "text-orange-600"
    },
    {
      id: "tiempos",
      title: "TIEMPOS DE DESPACHO",
      description: "Revision de tiempos de entrega de las ordenes.",
      href: "/tiempos-despacho",
      icon: Clock,
      borderColor: "border-emerald-900/30",
      hoverBorder: "hover:border-emerald-900",
      bgColor: "bg-emerald-950/5",
      iconBg: "bg-emerald-950",
      textColor: "text-emerald-950"
    },
    {
      id: "inventario",
      title: "INVENTARIO SELECTIVO",
      description: "Auditoria de producto selectivo una vez ingresado al sistema.",
      href: "/inventario-selectivo",
      icon: PackageSearch,
      borderColor: "border-red-400/30",
      hoverBorder: "hover:border-red-500",
      bgColor: "bg-red-500/5",
      iconBg: "bg-red-500",
      textColor: "text-red-500"
    },
    {
      id: "diferencias",
      title: "DIFERENCIAS EN INVENTARIO",
      description: "Diferencias de materia prima ingresando al sistema vs lo que tiene en físico.",
      href: "/diferencias-inventario",
      icon: ClipboardList,
      borderColor: "border-slate-400/30",
      hoverBorder: "hover:border-slate-600",
      bgColor: "bg-slate-500/5",
      iconBg: "bg-slate-500",
      textColor: "text-slate-700"
    },
    {
      id: "kioskos",
      title: "CUADRE DE CAJA KIOSKOS",
      description: "Cuadre de ventas y depósitos especializados para kioskos.",
      href: "/cuadre-kioskos",
      icon: Handshake,
      borderColor: "border-sky-400/30",
      hoverBorder: "hover:border-sky-500",
      bgColor: "bg-sky-500/5",
      iconBg: "bg-sky-500",
      textColor: "text-sky-600"
    },
    {
      id: "traspaso",
      title: "CONTROL DE TRASPASO",
      description: "Auditoria de activos por el traspaso de administración.",
      href: "/control-traspaso",
      icon: Handshake,
      borderColor: "border-emerald-500/30",
      hoverBorder: "hover:border-emerald-500",
      bgColor: "bg-emerald-500/5",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-600"
    },
    {
      id: "pizzas",
      title: "CONVERTIDOR PIZZAS LISTAS",
      description: "Auditoria y conversión de inventario de pizzas preparadas.",
      href: "/convertidor-pizzas",
      icon: Pizza,
      borderColor: "border-red-600/30",
      hoverBorder: "hover:border-red-600",
      bgColor: "bg-red-600/5",
      iconBg: "bg-red-600",
      textColor: "text-red-700"
    }
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 container mx-auto py-12 px-4 max-w-6xl">
        <div className="space-y-12">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-4xl font-[900] tracking-tighter uppercase leading-none whitespace-nowrap">
                Contraloria <span className="text-primary">GC</span>
              </h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">
              Sistema Profesional de Controles Operativos
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 px-2 border-b-2 border-slate-100 pb-4">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 text-center">PANEL DE CONTROL</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {modules.map((mod) => (
                <Link key={mod.id} href={mod.href} prefetch={true} className="block group">
                  <div className={cn(
                    "h-full border-2 overflow-hidden bg-white cursor-pointer relative transition-all active:scale-95",
                    mod.borderColor,
                    mod.hoverBorder
                  )}>
                    <div className={cn("p-6 pb-8", mod.bgColor)}>
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
                        mod.iconBg
                      )}>
                        <mod.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className={cn("text-xl font-[900] uppercase leading-tight", mod.textColor)}>
                        {mod.title}
                      </h3>
                      <p className={cn("font-black text-[11px] mt-1 opacity-80", mod.textColor)}>
                        {mod.description}
                      </p>
                    </div>

                    <div className="px-6 py-6 border-t border-slate-50">
                      <div className={cn(
                        "flex items-center gap-2 font-[900] text-xs tracking-widest uppercase",
                        mod.textColor
                      )}>
                        INGRESAR
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] border-t bg-white mt-auto">
        <p>2026 CONTRALORÍA GRUPO COMIDAS • CGC SISTEMA DE CONTROLES OPERATIVOS. LP</p>
      </footer>
    </div>
  );
}
