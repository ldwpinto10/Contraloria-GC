"use client"

import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileCheck, 
  Loader2, 
  Image as ImageIcon,
  X,
  Target,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { toJpeg } from 'html-to-image';
import { InventoryItem } from "@/types";
import { cn } from "@/lib/utils";

interface InventoryReportDialogProps {
  items: InventoryItem[];
  unitBrand?: string;
  unitNumber?: string;
}

export function InventoryReportDialog({ 
  items,
  unitBrand = "",
  unitNumber = ""
}: InventoryReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Separate and sort items: Materia Prima vs Quimicos, and differences first
  const materiaPrima = items
    .filter(i => i.category === 'materia_prima' && i.product.trim() !== "")
    .sort((a, b) => {
      const diffA = Math.abs((parseFloat(a.audited) || 0) - (parseFloat(a.system) || 0));
      const diffB = Math.abs((parseFloat(b.audited) || 0) - (parseFloat(b.system) || 0));
      return diffB - diffA; // High difference first
    });

  const quimicos = items
    .filter(i => i.category === 'quimicos' && i.product.trim() !== "")
    .sort((a, b) => {
      const diffA = Math.abs((parseFloat(a.audited) || 0) - (parseFloat(a.system) || 0));
      const diffB = Math.abs((parseFloat(b.audited) || 0) - (parseFloat(b.system) || 0));
      return diffB - diffA; // High difference first
    });

  // Calculate efficiency
  const totalItems = items.filter(i => i.product.trim() !== "").length;
  const itemsWithDiff = items.filter(i => {
    if (i.product.trim() === "") return false;
    const diff = (parseFloat(i.audited) || 0) - (parseFloat(i.system) || 0);
    return Math.abs(diff) > 0.001;
  }).length;
  
  const efficiency = totalItems > 0 ? ((totalItems - itemsWithDiff) / totalItems) * 100 : 100;

  const handleSaveImage = async () => {
    if (reportRef.current === null) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const node = reportRef.current;
      const dataUrl = await toJpeg(node, { 
        quality: 1, 
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        skipFonts: true,
        width: node.scrollWidth,
        height: node.scrollHeight,
      });
      const link = document.createElement('a');
      link.download = `INVENTARIO-SELECTIVO-${unitBrand}-${unitNumber}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsOpen(false);
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderTable = (title: string, data: InventoryItem[]) => {
    if (data.length === 0) return null;
    return (
      <div className="space-y-0 mb-6">
        <div className="bg-slate-800 text-white px-4 py-2 font-black uppercase text-[11px] tracking-[0.2em] text-center border-x-2 border-t-2 border-slate-900">
          {title}
        </div>
        <table className="w-full border-2 border-slate-900 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900">
              <th className="w-10 font-black text-[9px] py-2 uppercase border-r border-slate-900">LISTADO</th>
              <th className="font-black text-[9px] py-2 uppercase text-left pl-3 border-r border-slate-900">PRODUCTO</th>
              <th className="w-20 font-black text-[9px] py-2 uppercase border-r border-slate-900">UNIDAD</th>
              <th className="w-20 font-black text-[9px] py-2 uppercase border-r border-slate-900">AUDITADO</th>
              <th className="w-20 font-black text-[9px] py-2 uppercase border-r border-slate-900">SISTEMA</th>
              <th className="w-20 font-black text-[9px] py-2 uppercase">DIFERENCIA</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const audit = parseFloat(item.audited) || 0;
              const sys = parseFloat(item.system) || 0;
              const diff = audit - sys;
              const hasDiff = Math.abs(diff) > 0.001;
              return (
                <tr key={item.id} className={cn("border-b border-slate-300", hasDiff ? "bg-red-50/30" : "bg-white")}>
                  <td className="text-center py-2 text-[10px] font-bold border-r border-slate-900">{idx + 1}</td>
                  <td className="pl-3 py-2 text-[10px] font-black uppercase border-r border-slate-900">{item.product}</td>
                  <td className="text-center py-2 text-[10px] font-black uppercase border-r border-slate-900">{item.unit}</td>
                  <td className="text-center py-2 text-[10px] font-black border-r border-slate-900">{audit.toFixed(2)}</td>
                  <td className="text-center py-2 text-[10px] font-black border-r border-slate-900">{sys.toFixed(2)}</td>
                  <td className={cn(
                    "text-center py-2 text-[10px] font-black",
                    hasDiff ? "text-red-600" : "text-slate-900"
                  )}>
                    {diff === 0 ? '0.00' : diff.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-red-600 hover:bg-red-700">
          <FileCheck className="h-6 w-6" />
          GENERAR REPORTE
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[90vh]">
        <DialogHeader className="p-4 bg-slate-900 text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="font-black uppercase tracking-tight text-base">VISTA PREVIA INVENTARIO SELECTIVO</DialogTitle>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
        </DialogHeader>

        <div className="bg-slate-100 p-6 flex justify-center no-print overflow-y-auto flex-1">
          <div 
            ref={reportRef}
            className="w-[800px] bg-white text-slate-900 flex flex-col font-sans shadow-sm p-0"
            style={{ height: 'auto', minHeight: 'fit-content' }}
          >
            <div className="bg-red-600 text-white p-6 text-center border-b-4 border-slate-900">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">CONTRALORIA CG - AUDITORIA DE PRODUCTO</p>
              <h1 className="font-black uppercase tracking-tight text-2xl flex items-center justify-center gap-2">
                TOMA SELECTIVA DE INVENTARIO
              </h1>
              <div className="mt-2 inline-flex items-center gap-2 bg-white/10 px-6 py-1.5 rounded-full border border-white/20">
                <span className="font-black text-base uppercase tracking-wider">
                  {unitBrand || 'UNIDAD'} {unitNumber || '00'}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Items Auditados</p>
                  <p className="text-2xl font-black text-slate-900">{totalItems}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border-2 border-red-100 text-center">
                  <p className="text-[9px] font-black text-red-400 uppercase mb-1">Con Diferencias</p>
                  <p className="text-2xl font-black text-red-600">{itemsWithDiff}</p>
                </div>
                <div className={cn(
                  "p-4 rounded-xl border-2 text-center",
                  efficiency >= 95 ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"
                )}>
                  <p className={cn(
                    "text-[9px] font-black uppercase mb-1",
                    efficiency >= 95 ? "text-emerald-400" : "text-orange-400"
                  )}>Eficiencia General</p>
                  <p className={cn(
                    "text-2xl font-black",
                    efficiency >= 95 ? "text-emerald-600" : "text-orange-600"
                  )}>{efficiency.toFixed(1)}%</p>
                </div>
              </div>

              {renderTable("TOMA SELECTIVA DE MATERIA PRIMA", materiaPrima)}
              {renderTable("TOMA SELECTIVA DE QUIMICOS", quimicos)}

              <div className="mt-16 pt-12 border-t-2 border-slate-100">
                <div className="grid grid-cols-2 gap-20 px-10">
                  <div className="text-center">
                    <div className="h-px bg-slate-900 w-full mb-2"></div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Firma Auditor</p>
                  </div>
                  <div className="text-center">
                    <div className="h-px bg-slate-900 w-full mb-2"></div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Firma Gerencia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-white border-t flex flex-row gap-3 justify-center items-center no-print shrink-0">
          <Button onClick={handleSaveImage} disabled={isExporting} className="w-full gap-2 font-black bg-slate-900 h-12 text-xs uppercase shadow-md">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            GENERAR REPORTE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
