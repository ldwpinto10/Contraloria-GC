
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
  PackageSearch,
  ShieldCheck,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { InventoryItem, CurrencyCode, CURRENCIES } from '@/types';
import { cn } from '@/lib/utils';

const THEME_RED = '#ec5f40';

interface InventoryReportDialogProps {
  items: InventoryItem[];
  unitBrand?: string;
  unitNumber?: string;
  currencyCode: CurrencyCode;
}

export function InventoryReportDialog({
  items,
  unitBrand = '',
  unitNumber = '',
  currencyCode,
}: InventoryReportDialogProps) {
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
  const formatValue = (val: number) => {
    return `${currency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const activeItems = items.filter((i) => i.product.trim() !== '');

  const sortInventoryItems = (a: InventoryItem, b: InventoryItem) => {
    const diffA = (parseFloat(a.audited) || 0) - (parseFloat(a.system) || 0);
    const diffB = (parseFloat(b.audited) || 0) - (parseFloat(b.system) || 0);

    const getCategory = (d: number) => {
      if (d < -0.001) return 1; // Faltante
      if (d > 0.001) return 2;  // Sobrante
      return 3;                 // Cuadra
    };

    const catA = getCategory(diffA);
    const catB = getCategory(diffB);

    if (catA !== catB) return catA - catB;
    return Math.abs(diffB) - Math.abs(diffA);
  };

  const materiaPrima = activeItems
    .filter((i) => i.category === 'materia_prima')
    .sort(sortInventoryItems);

  const quimicos = activeItems
    .filter((i) => i.category === 'quimicos')
    .sort(sortInventoryItems);

  let itemsWithDiff = 0;
  let positiveValue = 0;
  let negativeValue = 0;

  activeItems.forEach((i) => {
    const audit = parseFloat(i.audited) || 0;
    const sys = parseFloat(i.system) || 0;
    const price = parseFloat(i.price) || 0;
    const diff = audit - sys;
    if (Math.abs(diff) > 0.001) {
      itemsWithDiff++;
      if (diff > 0) positiveValue += diff * price;
      else negativeValue += Math.abs(diff) * price;
    }
  });

  const precision = activeItems.length > 0 ? Math.round(((activeItems.length - itemsWithDiff) / activeItems.length) * 100) : 100;

  const handleSaveImage = async () => {
    if (reportRef.current === null) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const node = reportRef.current;
      const dataUrl = await toJpeg(node, {
        quality: 1,
        backgroundColor: '#ffffff',
        width: REPORT_WIDTH,
        pixelRatio: 4, // ULTRA HD
        skipFonts: true,
      });

      localStorage.setItem('contraloria_gc_inventory_v3_reported', 'true');

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
      <div className="mb-6">
        <div style={{ backgroundColor: THEME_RED }} className="text-white px-6 py-2 font-black uppercase text-base tracking-[0.15em] text-center border-x-2 border-t-2 border-slate-900">
          {title}
        </div>
        <table className="w-full border-2 border-slate-900 border-collapse text-sm table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900">
              <th className="w-[50%] font-black py-2 uppercase text-left pl-6 border-r-2 border-slate-900">PRODUCTO</th>
              <th className="w-[16.6%] font-black py-2 uppercase border-r-2 border-slate-900 text-center">AUDITADO</th>
              <th className="w-[16.6%] font-black py-2 uppercase border-r-2 border-slate-900 text-center">SISTEMA</th>
              <th className="w-[16.8%] font-black py-2 uppercase text-center">DIFERENCIA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => {
              const audit = parseFloat(item.audited) || 0;
              const sys = parseFloat(item.system) || 0;
              const diff = audit - sys;
              return (
                <tr key={item.id} className={cn(idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white')}>
                  <td className="pl-6 py-2 font-black uppercase border-r-2 border-slate-900 align-middle text-[12px]">{item.product}</td>
                  <td className="text-center py-2 font-black border-r-2 border-slate-900 tabular-nums align-middle text-[12px]">{audit.toFixed(1)}</td>
                  <td className="text-center py-2 font-black border-r-2 border-slate-900 text-slate-600 tabular-nums align-middle text-[12px]">{sys.toFixed(1)}</td>
                  <td className={cn(
                    'text-center py-2 font-black tabular-nums align-middle text-[12px]',
                    diff > 0.001 ? 'text-blue-600' : diff < -0.001 ? 'text-red-600' : 'text-emerald-600',
                  )}>
                    {Math.abs(diff) < 0.001 ? '0' : diff.toFixed(1)}
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
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button style={{ backgroundColor: THEME_RED }} className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase text-white border-none">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-slate-900 text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-red-400" />
              <DialogTitle className="font-black uppercase tracking-widest text-[10px]">Vista Previa Inventario</DialogTitle>
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
                <div style={{ backgroundColor: THEME_RED }} className="text-white py-8 flex flex-col items-center gap-3 shrink-0">
                  <ShieldCheck className="h-10 w-10 text-white/80" strokeWidth={1.5} />
                  <h1 className="font-black uppercase tracking-widest text-3xl text-center leading-tight">
                    TOMA SELECTIVA DE INVENTARIO
                  </h1>
                  <div className="inline-flex items-center justify-center min-w-[260px] py-2 rounded-full border-2 border-white/30 bg-white/10 whitespace-nowrap px-6">
                    <span className="font-black text-2xl uppercase tracking-[0.1em] text-white">
                      {unitBrand.toUpperCase()} #{unitNumber || '00'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 flex flex-col pb-12">
                  <div className="grid grid-cols-4 gap-4 shrink-0">
                    <div className="bg-white p-4 rounded-[1rem] border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">DIFERENCIAS</p>
                      <p className="text-2xl font-black text-red-600">{itemsWithDiff}</p>
                    </div>
                    <div style={{ backgroundColor: THEME_RED }} className="p-4 rounded-[1rem] border-2 border-slate-900 shadow-xl text-center text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">PRECISIÓN</p>
                      <p className="text-2xl font-black">{precision}%</p>
                    </div>
                    <div className="bg-white p-4 rounded-[1rem] border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">SOBRANTE</p>
                      <p className="text-xl font-black text-blue-600">{formatValue(positiveValue)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-[1rem] border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">FALTANTE</p>
                      <p className="text-xl font-black text-red-600">{formatValue(negativeValue)}</p>
                    </div>
                  </div>

                  <div className="shrink-0 overflow-hidden">
                    {renderTable('MATERIA PRIMA', materiaPrima)}
                    {renderTable('QUIMICOS', quimicos)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-white border-t flex flex-row gap-3 justify-center items-center no-print shrink-0">
            <Button onClick={handleSaveImage} disabled={isExporting} style={{ backgroundColor: THEME_RED }} className="w-full gap-2 font-black h-14 text-xl uppercase shadow-md hover:opacity-90 transition-all text-white border-none">
              {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
              GENERAR REPORTE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
