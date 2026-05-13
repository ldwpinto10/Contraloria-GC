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
  Check,
  Store,
  ShieldCheck
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { CurrencyCode, CURRENCIES, KioskoEntry } from '@/types';
import { cn } from '@/lib/utils';

interface KioskoReportDialogProps {
  entries: KioskoEntry[];
  unitBrand?: string;
  unitNumber?: string;
  storeUnit?: string;
  currencyCode: CurrencyCode;
}

export function KioskoReportDialog({
  entries,
  unitBrand = '',
  unitNumber = '',
  storeUnit = '',
  currencyCode,
}: KioskoReportDialogProps) {
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

  const totals = entries.reduce((acc, row) => {
    const fact = safeParse(row.facturado);
    const red = safeParse(row.reducciones);
    const efec = safeParse(row.efectivo);
    const tarj = safeParse(row.tarjeta);
    const diff = (efec + tarj) - (fact - red);
    return {
      facturado: acc.facturado + fact,
      reducciones: acc.reducciones + red,
      efectivo: acc.efectivo + efec,
      tarjeta: acc.tarjeta + tarj,
      diff: acc.diff + diff,
    };
  }, { facturado: 0, reducciones: 0, efectivo: 0, tarjeta: 0, diff: 0 });

  const isCuadrado = Math.abs(totals.diff) < 0.01;
  const isSobrante = totals.diff >= 0.01;
  const isFaltante = totals.diff <= -0.01;

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

      localStorage.setItem('contraloria_gc_kioskos_v2_reported', 'true');

      const link = document.createElement('a');
      link.download = `CUADRE-KIOSKO-${unitBrand}-${unitNumber}.jpg`;
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
          <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-sky-500 hover:bg-sky-600 text-white border-none">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-slate-900 text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-sky-400" />
              <DialogTitle className="font-black uppercase tracking-[0.15em] text-[10px]">Vista Previa Cuadre Kiosko</DialogTitle>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </DialogHeader>

          <div className="bg-slate-100 no-print overflow-y-auto flex-1 p-4 flex justify-center items-start">
            <div className="relative origin-top transform" style={{ width: `${REPORT_WIDTH}px`, scale: previewScale }}>
              <div
                ref={reportRef}
                className="bg-white text-slate-900 flex flex-col font-sans overflow-hidden"
                style={{ width: `${REPORT_WIDTH}px`, height: 'auto' }}
              >
                <div className="bg-slate-900 text-white py-8 flex flex-col items-center gap-3 shrink-0">
                  <ShieldCheck className="h-10 w-10 text-sky-400" strokeWidth={1.5} />
                  <h1 className="font-black uppercase tracking-tight text-3xl text-center leading-tight">
                    CUADRE DE CAJA KIOSKOS
                  </h1>
                  <div className="inline-flex items-center justify-center min-w-[240px] py-2 rounded-full bg-white/10 border border-white/20 px-6">
                    <span className="font-black text-2xl uppercase tracking-[0.2em] text-white">
                      {unitBrand.toUpperCase()} #{storeUnit || '00'} - {unitNumber || 'KSK-00'}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-6 space-y-8 flex-1 flex flex-col pb-12">
                  <div className="bg-white rounded-[1rem] border-2 border-slate-900 shadow-xl overflow-hidden shrink-0">
                    <div className="bg-sky-500 px-6 py-3 flex items-center gap-2 border-b-2 border-slate-900">
                      <Store className="h-6 w-6 text-white" />
                      <span className="font-black uppercase tracking-[0.15em] text-lg text-white">AUDITORÍA DE VENTAS DIARIAS</span>
                    </div>
                    <table className="w-full border-collapse text-sm table-fixed border-none">
                      <thead className="border-none">
                        <tr className="bg-slate-100 border-b-2 border-slate-900 border-t-0">
                          <th className="w-[12%] font-black py-4 uppercase text-center border-r-2 border-slate-900 align-middle">FECHA</th>
                          <th className="w-[17%] font-black py-4 uppercase text-center border-r-2 border-slate-900 align-middle">FACTURADO</th>
                          <th className="w-[17%] font-black py-4 uppercase text-center border-r-2 border-slate-900 align-middle">EFECTIVO</th>
                          <th className="w-[17%] font-black py-4 uppercase text-center border-r-2 border-slate-900 align-middle">TARJETA POS</th>
                          <th className="w-[17%] font-black py-4 uppercase text-center border-r-2 border-slate-900 align-middle">REDUCCIONES</th>
                          <th className="w-[20%] font-black py-4 uppercase text-center border-l-2 border-slate-900 bg-slate-300 align-middle">DIFERENCIA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {entries.map((row) => {
                          const fact = safeParse(row.facturado);
                          const red = safeParse(row.reducciones);
                          const efec = safeParse(row.efectivo);
                          const tarj = safeParse(row.tarjeta);
                          const diff = (efec + tarj) - (fact - red);
                          return (
                            <tr key={row.id} className="bg-white">
                              <td className="text-center py-3 font-black text-slate-700 border-r-2 border-slate-900 align-middle">{row.date}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(fact)}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(efec)}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(tarj)}</td>
                              <td className="text-center py-3 font-bold text-slate-600 border-r-2 border-slate-900 tabular-nums align-middle">{format(red)}</td>
                              <td className={cn(
                                'text-center py-3 font-black tabular-nums border-l-2 border-slate-900 bg-slate-200 align-middle',
                                Math.abs(diff) < 0.01 ? 'text-emerald-500' : diff > 0.01 ? 'text-blue-500' : 'text-red-500',
                              )}>{format(diff)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4 shrink-0 mt-4">
                    <div className="bg-slate-900 p-6 rounded-[1rem] shadow-xl text-center border-2 border-white/10 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">TOTAL DEPOSITADO (EFEC + POS)</p>
                      <p className="text-3xl font-black text-white tabular-nums">{format(totals.efectivo + totals.tarjeta)}</p>
                    </div>
                    <div className={cn(
                      'p-6 rounded-[1rem] shadow-xl text-center border-2 bg-white flex flex-col justify-center',
                      isCuadrado ? 'border-emerald-500 text-emerald-600' : 
                      isSobrante ? 'border-blue-500 text-blue-600' :
                      'border-red-500 text-red-600'
                    )}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">DIFERENCIA</p>
                      <p className="text-3xl font-black tabular-nums">{format(totals.diff)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-200 flex flex-col gap-4 shrink-0 shadow-inner">
                    <h3 className="text-center font-black text-xs text-slate-400 uppercase tracking-[0.4em]">CERTIFICADO KIOSKO</h3>
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
