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
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { InventoryDifferenceItem, CurrencyCode, CURRENCIES } from '@/types';
import { cn } from '@/lib/utils';

interface DifferenceReportDialogProps {
  items: InventoryDifferenceItem[];
  unitBrand?: string;
  unitNumber?: string;
  currencyCode: CurrencyCode;
  salesValue?: string;
}

export function DifferenceReportDialog({
  items,
  unitBrand = '',
  unitNumber = '',
  currencyCode,
  salesValue = '',
}: DifferenceReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.2);
  const reportRef = useRef<HTMLDivElement>(null);

  const REPORT_WIDTH = 900;

  useEffect(() => {
    const updateScale = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const dialogWidth = Math.min(width * 0.95, 1000);
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

  const currency = CURRENCIES[currencyCode];

  const format = (val: number) => {
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${val < 0 ? '-' : ''}${currency.symbol}${formatted}`;
  };

  const handleSaveImage = async () => {
    if (reportRef.current === null) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const node = reportRef.current;
      const dataUrl = await toJpeg(node, {
        quality: 1,
        backgroundColor: '#ffffff',
        width: REPORT_WIDTH,
        pixelRatio: 4,
        skipFonts: true,
      });

      localStorage.setItem('contraloria_gc_differences_v2_reported', 'true');

      const link = document.createElement('a');
      link.download = `DIFERENCIA-INVENTARIO-${unitBrand}-${unitNumber}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsOpen(false);
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const activeItems = items
    .filter((i) => i.product.trim() !== '')
    .sort((a, b) => {
      const impactA = ((parseFloat(a.physical) || 0) - (parseFloat(a.entered) || 0)) * (parseFloat(a.price) || 0);
      const impactB = ((parseFloat(b.physical) || 0) - (parseFloat(b.entered) || 0)) * (parseFloat(b.price) || 0);
      return impactB - impactA;
    });

  let totalPositive = 0;
  activeItems.forEach((item) => {
    const phys = parseFloat(item.physical) || 0;
    const ent = parseFloat(item.entered) || 0;
    const price = parseFloat(item.price) || 0;
    const diff = phys - ent;
    const impact = diff * price;
    if (impact > 0.001) totalPositive += impact;
  });

  const sales = parseFloat(salesValue) || 0;
  const impactPercentage = sales > 0 ? (totalPositive / sales) * 100 : 0;

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-slate-700 hover:bg-slate-800 text-white">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-slate-900 text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              <DialogTitle className="font-black uppercase tracking-widest text-[10px]">Vista Previa Diferencias</DialogTitle>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </DialogHeader>

          <div className="bg-slate-100 no-print overflow-y-auto flex-1 p-2 md:p-4 flex justify-center items-start">
            <div className="relative origin-top transform" style={{ width: `${REPORT_WIDTH}px`, scale: previewScale }}>
              <div
                ref={reportRef}
                className="bg-white text-slate-900 flex flex-col font-sans overflow-hidden"
                style={{ width: `${REPORT_WIDTH}px`, height: 'auto' }}
              >
                <div className="bg-slate-700 text-white py-8 flex flex-col items-center gap-3 shrink-0">
                  <ShieldCheck className="h-10 w-10 text-white" strokeWidth={1.5} />
                  <h1 className="font-black uppercase tracking-widest text-3xl text-center leading-tight">
                    DIFERENCIAS EN INVENTARIO
                  </h1>
                  <div className="inline-flex items-center justify-center min-w-[260px] py-2 rounded-full border-2 border-white/30 bg-white/10 whitespace-nowrap px-6">
                    <span className="font-black text-2xl uppercase tracking-[0.1em] text-white">
                      {unitBrand.toUpperCase()} #{unitNumber || '00'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 flex flex-col pb-12">
                  <div className="grid grid-cols-3 gap-4 shrink-0">
                    <div className="bg-slate-50 p-4 rounded-[1rem] border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">ITEMS</p>
                      <p className="text-2xl font-black text-slate-900">{activeItems.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-[1rem] border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">IMPACTO TOTAL</p>
                      <p className="text-2xl font-black text-blue-600">{format(totalPositive)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-[1rem] border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">IMPACTO S/VENTA</p>
                      <p className="text-2xl font-black text-emerald-600">{impactPercentage.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="border-2 border-slate-900 rounded-[1.5rem] overflow-hidden shadow-xl shrink-0">
                    <table className="w-full border-collapse text-sm table-fixed">
                      <thead className="bg-slate-100 border-b-2 border-slate-900">
                        <tr>
                          <th className="w-[50%] font-black py-3 uppercase text-left pl-6 border-r-2 border-slate-900">PRODUCTO</th>
                          <th className="w-[12.5%] font-black py-3 uppercase text-center border-r-2 border-slate-900">FÍSICO</th>
                          <th className="w-[12.5%] font-black py-3 uppercase text-center border-r-2 border-slate-900">SISTEMA</th>
                          <th className="w-[12.5%] font-black py-3 uppercase text-center border-r-2 border-slate-900">DIF.</th>
                          <th className="w-[12.5%] font-black py-3 uppercase text-center">IMPACTO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeItems.map((item, idx) => {
                          const phys = parseFloat(item.physical) || 0;
                          const ent = parseFloat(item.entered) || 0;
                          const price = parseFloat(item.price) || 0;
                          const diff = phys - ent;
                          const impact = diff * price;
                          return (
                            <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}>
                              <td className="pl-6 py-2 font-black text-slate-800 uppercase border-r-2 border-slate-900 align-middle">{item.product}</td>
                              <td className="text-center py-2 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{phys.toFixed(1)}</td>
                              <td className="text-center py-2 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{ent.toFixed(1)}</td>
                              <td className={cn('text-center py-2 font-black border-r-2 border-slate-900 tabular-nums align-middle', diff < -0.001 ? 'text-red-500' : diff > 0.001 ? 'text-blue-500' : 'text-slate-300')}>
                                {diff === 0 ? '0' : diff.toFixed(1)}
                              </td>
                              <td className={cn('py-2 font-black text-center tabular-nums align-middle', impact < -0.001 ? 'text-red-600' : impact > 0.001 ? 'text-blue-600' : 'text-slate-400')}>
                                {format(impact)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-white border-t flex flex-row gap-3 justify-center items-center no-print shrink-0">
            <Button onClick={handleSaveImage} disabled={isExporting} className="w-full gap-2 font-black bg-slate-900 h-14 text-xl uppercase shadow-md hover:bg-slate-800 transition-all text-white border-none">
              {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
              GENERAR REPORTE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
