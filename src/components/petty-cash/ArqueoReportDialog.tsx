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
  CreditCard,
  Banknote,
  Check,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { CurrencyCode, CURRENCIES, ArqueoCardEntry, ArqueoCashEntry } from '@/types';
import { cn } from '@/lib/utils';

interface ArqueoReportDialogProps {
  cardEntries: ArqueoCardEntry[];
  cashEntries: ArqueoCashEntry[];
  unitBrand?: string;
  unitNumber?: string;
  currencyCode: CurrencyCode;
}

export function ArqueoReportDialog({
  cardEntries,
  cashEntries,
  unitBrand = '',
  unitNumber = '',
  currencyCode,
}: ArqueoReportDialogProps) {
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

  const safeParse = (val: any): number => {
    if (val === null || val === undefined || val === '' || typeof val === 'object') return 0;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isFinite(parsed) ? parsed : 0;
  };

  const format = (val: number) => {
    const safeVal = isFinite(val) ? val : 0;
    const formatted = Math.abs(safeVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${safeVal < -0.001 ? '-' : ''}${currency.symbol}${formatted}`;
  };

  const cardTotals = cardEntries.reduce((acc, row) => {
    const cp = safeParse(row.cierrePos);
    const sis = safeParse(row.sistema);
    return {
      cierre: acc.cierre + cp,
      sistema: acc.sistema + sis,
      diff: acc.diff + (cp - sis),
    };
  }, { cierre: 0, sistema: 0, diff: 0 });

  const cashTotals = cashEntries.reduce((acc, row) => {
    const vent = safeParse(row.ventaSd);
    const ent = safeParse(row.entrega);
    return {
      venta: acc.venta + vent,
      entrega: acc.entrega + ent,
      diff: acc.diff + (ent - vent),
    };
  }, { venta: 0, entrega: 0, diff: 0 });

  const totalVentaSistema = cardTotals.sistema + cashTotals.venta;
  const totalVentaEntregada = cardTotals.cierre + cashTotals.entrega;
  const finalDiff = totalVentaEntregada - totalVentaSistema;

  const isCuadrado = Math.abs(finalDiff) < 0.01;
  const isSobrante = finalDiff >= 0.01;
  const isFaltante = finalDiff <= -0.01;

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

      localStorage.setItem('contraloria_gc_arqueos_v1_reported', 'true');

      const link = document.createElement('a');
      link.download = `ARQUEO-SD-${unitBrand}-${unitNumber}.jpg`;
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
          <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-[#f97316] hover:bg-orange-600 text-white border-none">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-[#0f172a] text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <DialogTitle className="font-bold uppercase tracking-[0.15em] text-[10px]">Vista Previa Arqueo</DialogTitle>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </DialogHeader>

          <div className="bg-slate-100 no-print overflow-y-auto flex-1 p-4 flex justify-center items-start">
            <div className="relative origin-top transform" style={{ width: `${REPORT_WIDTH}px`, scale: previewScale }}>
              <div
                ref={reportRef}
                className="bg-white text-slate-900 flex flex-col font-sans overflow-hidden"
                style={{ width: `${REPORT_WIDTH}px`, height: 'auto' }}
              >
                <div className="bg-[#0f172a] text-white py-8 flex flex-col items-center gap-3 shrink-0">
                  <h1 className="font-black uppercase tracking-tight text-3xl text-center leading-tight">
                    CUADRE ARQUEO DE VENTAS
                  </h1>
                  <div className="inline-flex items-center justify-center min-w-[240px] py-2 rounded-full bg-white/10 border border-white/20 px-6">
                    <span className="font-black text-2xl uppercase tracking-[0.2em] text-white">
                      {unitBrand.toUpperCase()} #{unitNumber || '00'}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-6 space-y-8 flex-1 flex flex-col pb-12">
                  <div className="bg-white rounded-[1rem] border-2 border-slate-900 shadow-xl overflow-hidden shrink-0">
                    <div className="bg-[#f97316] px-6 py-3 flex items-center gap-2 border-b-2 border-slate-900">
                      <CreditCard className="h-6 w-6 text-white" />
                      <span className="font-black uppercase tracking-[0.15em] text-lg text-white">CONTROL DE TARJETAS</span>
                    </div>
                    <table className="w-full border-collapse text-sm table-fixed">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-900">
                          <th className="w-1/4 font-black py-4 uppercase text-center border-r-2 border-slate-900">FECHA</th>
                          <th className="w-1/4 font-black py-4 uppercase text-center border-r-2 border-slate-900">SISTEMA</th>
                          <th className="w-1/4 font-black py-4 uppercase text-center border-r-2 border-slate-900">CIERRE POS</th>
                          <th className="w-1/4 font-black py-4 uppercase text-center">DIFERENCIA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {cardEntries.map((row) => {
                          const sis = safeParse(row.sistema);
                          const cp = safeParse(row.cierrePos);
                          const diff = cp - sis;
                          return (
                            <tr key={row.id} className="bg-white">
                              <td className="text-center py-3 font-black text-slate-700 border-r-2 border-slate-900 align-middle">{row.date}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(sis)}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(cp)}</td>
                              <td className={cn(
                                'text-center py-3 font-black tabular-nums align-middle',
                                Math.abs(diff) < 0.01 ? 'text-emerald-500' : diff > 0.01 ? 'text-blue-500' : 'text-red-500',
                              )}>{format(diff)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white rounded-[1rem] border-2 border-slate-900 shadow-xl overflow-hidden shrink-0">
                    <div className="bg-[#f97316] px-6 py-3 flex items-center gap-2 border-b-2 border-slate-900">
                      <Banknote className="h-6 w-6 text-white" />
                      <span className="font-black uppercase tracking-[0.15em] text-lg text-white">CONTROL DE EFECTIVO</span>
                    </div>
                    <table className="w-full border-collapse text-sm table-fixed">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-900">
                          <th className="w-1/4 font-black py-4 uppercase text-center border-r-2 border-slate-900">FECHA</th>
                          <th className="w-1/4 font-black py-4 uppercase text-center border-r-2 border-slate-900">EFECTIVO SD</th>
                          <th className="w-1/4 font-black py-4 uppercase text-center border-r-2 border-slate-900">BANCO</th>
                          <th className="w-1/4 font-black py-4 uppercase text-center">DIFERENCIA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {cashEntries.map((row) => {
                          const sis = safeParse(row.ventaSd);
                          const ent = safeParse(row.entrega);
                          const diff = ent - sis;
                          return (
                            <tr key={row.id} className="bg-white">
                              <td className="text-center py-3 font-black text-slate-700 border-r-2 border-slate-900 align-middle">{row.date}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(sis)}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(ent)}</td>
                              <td className={cn(
                                'text-center py-3 font-black tabular-nums align-middle',
                                Math.abs(diff) < 0.01 ? 'text-emerald-500' : diff > 0.01 ? 'text-blue-500' : 'text-red-500',
                              )}>{format(diff)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-3 gap-4 shrink-0 mt-4">
                    <div className="bg-[#0f172a] p-4 rounded-[1rem] shadow-xl text-center border-2 border-white/10 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">VENTA SISTEMA</p>
                      <p className="text-2xl font-black text-white tabular-nums">{format(totalVentaSistema)}</p>
                    </div>
                    <div className="bg-[#0f172a] p-4 rounded-[1rem] shadow-xl text-center border-2 border-white/10 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">TOTAL DEPÓSITO</p>
                      <p className="text-2xl font-black text-white tabular-nums">{format(totalVentaEntregada)}</p>
                    </div>
                    <div className={cn(
                      'p-4 rounded-[1rem] shadow-xl text-center border-2 bg-white flex flex-col justify-center',
                      isCuadrado ? 'border-emerald-500 text-emerald-600' : 
                      isSobrante ? 'border-blue-500 text-blue-600' :
                      'border-red-500 text-red-600'
                    )}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">DIFERENCIA</p>
                      <p className="text-2xl font-black tabular-nums">{format(finalDiff)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-200 flex flex-col gap-4 shrink-0 shadow-inner">
                    <h3 className="text-center font-black text-xs text-slate-400 uppercase tracking-[0.4em]">CERTIFICADO DE REVISIÓN</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className={cn(
                        "h-20 rounded-[1rem] flex flex-col items-center justify-center border-2 transition-all shadow-md",
                        isCuadrado ? "bg-emerald-500 border-transparent text-white" : "bg-white border-slate-100 text-slate-200"
                      )}>
                        <span className="font-black text-lg uppercase tracking-widest">CUADRADO</span>
                      </div>
                      <div className={cn(
                        "h-20 rounded-[1rem] flex items-center justify-center gap-2 border-2 transition-all shadow-md",
                        isFaltante ? "bg-red-500 border-transparent text-white" : "bg-white border-slate-100 text-slate-200"
                      )}>
                        <span className="font-black text-lg uppercase tracking-widest">FALTANTE</span>
                        {isFaltante && <Check className="h-5 w-5" strokeWidth={5} />}
                      </div>
                      <div className={cn(
                        "h-20 rounded-[1rem] flex items-center justify-center gap-2 border-2 transition-all shadow-md",
                        isSobrante ? "bg-blue-500 border-transparent text-white" : "bg-white border-slate-100 text-slate-200"
                      )}>
                        <span className="font-black text-lg uppercase tracking-widest">SOBRANTE</span>
                        {isSobrante && <Check className="h-5 w-5" strokeWidth={5} />}
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
              GENERAR REPORTE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
