'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileCheck,
  Loader2,
  Image as ImageIcon,
  X,
  ShieldCheck,
  Check,
  ListChecks
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { PizzaEntry } from '@/types';
import { cn } from '@/lib/utils';

interface IngredientResult {
  name: string;
  amount: number;
  unit: string;
}

interface PizzaBreakdown {
  id: string;
  product: string;
  quantity: number;
  ingredients: IngredientResult[];
}

interface ConsolidatedData {
  summary: Record<string, { unit: string; total: number; breakdown: Record<string, number> }>;
  productNames: string[];
}

interface PizzaConverterReportDialogProps {
  entries: PizzaEntry[];
  ingredientsPerPizza: PizzaBreakdown[];
  consolidatedSummary: ConsolidatedData;
  unitBrand?: string;
  unitNumber?: string;
}

export function PizzaConverterReportDialog({
  entries,
  ingredientsPerPizza,
  consolidatedSummary,
  unitBrand = '',
  unitNumber = '',
}: PizzaConverterReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.2);
  const reportRef = useRef<HTMLDivElement>(null);

  const REPORT_WIDTH = 1100;

  useEffect(() => {
    const updateScale = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const dialogWidth = Math.min(width * 0.95, 1200);
        const scale = dialogWidth / REPORT_WIDTH;
        setPreviewScale(scale);
      }
    };
    if (isOpen) {
      updateScale();
      window.addEventListener('resize', updateScale);
    }
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  const activeEntries = entries.filter((e) => (parseFloat(e.quantity) || 0) > 0);
  const totalPizzas = activeEntries.reduce((acc, e) => acc + (parseFloat(e.quantity) || 0), 0);

  const handleSaveImage = async () => {
    if (reportRef.current === null) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const node = reportRef.current;
      const dataUrl = await toJpeg(node, {
        quality: 1,
        backgroundColor: '#ffffff',
        width: REPORT_WIDTH,
        pixelRatio: 4,
        skipFonts: true,
      });

      const link = document.createElement('a');
      link.download = `CONSOLIDADO-PIZZAS-${unitBrand}-${unitNumber}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsOpen(false);
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-red-600 hover:bg-red-700 text-white border-none">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-[#0f172a] text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <DialogTitle className="font-bold uppercase tracking-[0.15em] text-[10px]">Vista Previa Reporte de Insumos</DialogTitle>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </DialogHeader>

          <div className="bg-slate-100 no-print overflow-y-auto flex-1 p-4 flex justify-center items-start">
            <div className="relative origin-top transform" style={{ width: `${REPORT_WIDTH}px`, scale: previewScale }}>
              <div
                ref={reportRef}
                className="bg-white text-slate-900 flex flex-col font-sans overflow-hidden border-2 border-slate-900"
                style={{ width: `${REPORT_WIDTH}px`, height: 'auto' }}
              >
                <div className="bg-red-600 text-white py-10 flex flex-col items-center gap-4 shrink-0">
                  <ShieldCheck className="h-12 w-12 text-white/90" strokeWidth={1.5} />
                  <h1 className="font-black uppercase tracking-tight text-4xl text-center leading-tight">
                    CONSOLIDADO DE PIZZAS PREPARADAS
                  </h1>
                  <div className="inline-flex items-center justify-center min-w-[280px] py-2 rounded-full bg-white/10 border border-white/20 px-8">
                    <span className="font-black text-3xl uppercase tracking-[0.2em] text-white">
                      {unitBrand.toUpperCase()} #{unitNumber || '00'}
                    </span>
                  </div>
                </div>

                <div className="px-10 py-10 space-y-12 flex-1 flex flex-col pb-20">
                  
                  <div className="space-y-6">
                    <div className="bg-slate-900 px-8 py-4 rounded-t-[1.5rem] flex items-center gap-4 border-2 border-slate-900 border-b-0 shadow-lg">
                      <ListChecks className="h-8 w-8 text-red-500" />
                      <span className="font-black uppercase tracking-[0.2em] text-2xl text-white">RESUMEN CONSOLIDADO DE PIZZAS</span>
                    </div>
                    <div className="border-2 border-slate-900 rounded-b-[1.5rem] overflow-hidden shadow-2xl bg-white">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-100 border-b-2 border-slate-900">
                          <tr>
                            <th className="py-5 pl-10 text-left font-black uppercase tracking-widest text-slate-600 border-r-2 border-slate-900 text-lg">INGREDIENTE</th>
                            <th className="py-5 text-center font-black uppercase tracking-widest text-red-600 bg-red-50 border-r-2 border-slate-900 text-xl">TOTAL</th>
                            {consolidatedSummary.productNames.map(pName => (
                              <th key={pName} className="py-5 text-center font-black uppercase tracking-widest text-slate-500 border-r-2 border-slate-900 text-sm">
                                {pName.replace("PIZZA ", "")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {Object.entries(consolidatedSummary.summary).map(([ingName, data], idx) => (
                            <tr key={ingName} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                              <td className="py-4 pl-10 font-black uppercase text-slate-800 border-r-2 border-slate-900 text-lg">
                                {ingName} <span className="text-slate-400 ml-1 text-sm">({data.unit})</span>
                              </td>
                              <td className="py-4 text-center font-black text-red-600 text-3xl tabular-nums bg-red-50/40 border-r-2 border-slate-900">
                                {data.total.toFixed(4)}
                              </td>
                              {consolidatedSummary.productNames.map(pName => (
                                <td key={pName} className="py-4 text-center font-bold text-slate-600 border-r-2 border-slate-900 text-lg tabular-nums">
                                  {data.breakdown[pName] ? data.breakdown[pName].toFixed(4) : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-10 bg-slate-50/50 p-10 rounded-[3rem] border-4 border-slate-900 flex flex-col gap-8 shadow-inner text-center">
                    <h3 className="font-black text-lg text-slate-400 uppercase tracking-[0.6em]">CERTIFICADO DE AUDITORÍA CGC</h3>
                    <div className="flex justify-center items-center gap-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-emerald-500 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-8 border-white">
                          <Check className="h-12 w-12" strokeWidth={5} />
                        </div>
                        <span className="font-black text-emerald-600 uppercase text-sm tracking-[0.3em]">VALIDADO</span>
                      </div>
                      <div className="text-left border-l-8 border-red-600 pl-10 space-y-2">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Resumen de Operación</p>
                        <p className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">TOTAL PIZZAS: {totalPizzas.toFixed(2)}</p>
                        <p className="text-slate-500 font-bold text-sm uppercase">CÁLCULO BASADO EN RECETAS ESTÁNDAR CONSOLIDADAS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-white border-t flex flex-row gap-3 justify-center items-center no-print shrink-0">
            <Button onClick={handleSaveImage} disabled={isExporting} className="w-full gap-2 font-black bg-[#0f172a] h-14 text-xl uppercase shadow-md hover:bg-slate-800 transition-all text-white border-none">
              {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
              DESCARGAR REPORTE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}