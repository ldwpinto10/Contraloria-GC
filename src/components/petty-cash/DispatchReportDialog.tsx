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
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { DispatchOrder } from '@/types';
import { cn } from '@/lib/utils';

interface DispatchReportDialogProps {
  orders: DispatchOrder[];
  unitBrand?: string;
  unitNumber?: string;
  averageTime: string;
  totalCombos: number;
}

export function DispatchReportDialog({
  orders,
  unitBrand = '',
  unitNumber = '',
  averageTime,
  totalCombos,
}: DispatchReportDialogProps) {
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

      localStorage.setItem('contraloria_gc_dispatch_v1_reported', 'true');

      const link = document.createElement('a');
      link.download = `TIEMPOS-DESPACHO-${unitBrand}-${unitNumber}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsOpen(false);
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const activeOrders = orders.filter((o) => (o.orderNumber || '').trim() !== '');

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-[#062c24] hover:bg-[#041d18] text-white border-none">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-[#062c24] text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <DialogTitle className="font-black uppercase tracking-widest text-[10px]">Vista Previa Despacho</DialogTitle>
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
                <div className="bg-[#062c24] text-white py-8 flex flex-col items-center gap-2 shrink-0">
                  <ShieldCheck className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
                  <h1 className="font-[900] uppercase tracking-tight text-3xl text-center leading-tight">
                    TIEMPOS DE DESPACHO
                  </h1>
                  <div className="mt-1 inline-flex items-center justify-center min-w-[260px] py-2 rounded-full border-2 border-white/30 bg-white/10 whitespace-nowrap px-6">
                    <span className="font-black text-2xl uppercase tracking-[0.1em] text-white">
                      {unitBrand.toUpperCase()} #{unitNumber || '00'}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4 flex-1 flex flex-col pb-12">
                  <div className="bg-[#062c24] rounded-[1rem] py-4 px-6 grid grid-cols-3 shadow-2xl shrink-0">
                    <div className="text-center space-y-1 border-r-2 border-white/10">
                      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">ÓRDENES</p>
                      <p className="text-[32px] font-[900] text-white leading-none">{activeOrders.length}</p>
                    </div>
                    <div className="text-center space-y-1 border-r-2 border-white/10">
                      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">COMBOS</p>
                      <p className="text-[32px] font-[900] text-[#10b981] leading-none">{totalCombos}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">PROMEDIO</p>
                      <p className="text-[32px] font-[900] text-[#10b981] tabular-nums leading-none">{averageTime.slice(3)}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[1.5rem] border-2 border-slate-900 overflow-hidden shadow-xl shrink-0">
                    <table className="w-full border-collapse text-sm table-fixed border-none">
                      <thead className="border-none">
                        <tr className="bg-slate-100 border-b-2 border-slate-900 border-t-0">
                          <th className="w-[10%] font-black py-3 uppercase text-center border-r-2 border-slate-900 align-middle">ORDEN</th>
                          <th className="w-[22%] font-black py-3 uppercase text-left pl-4 border-r-2 border-slate-900 align-middle">CANAL</th>
                          <th className="w-[5%] font-black py-3 uppercase text-center border-r-2 border-slate-900 align-middle">CANT</th>
                          <th className="w-[23%] font-black py-3 uppercase text-left pl-6 border-r-2 border-slate-900 align-middle">COMBO</th>
                          <th className="w-[10%] font-black py-3 uppercase text-center border-r-2 border-slate-900 align-middle">TIEMPO</th>
                          <th className="w-[30%] font-black py-3 uppercase text-left pl-6 align-middle">NOTAS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeOrders.map((order, idx) => (
                          <tr key={order.id} className={idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}>
                            <td className="py-2 text-[14px] font-black text-slate-900 text-center border-r-2 border-slate-900 align-middle">{order.orderNumber}</td>
                            <td className="pl-4 py-2 text-[14px] font-black uppercase text-slate-900 border-r-2 border-slate-900 whitespace-nowrap align-middle">{order.channel}</td>
                            <td className="text-center py-2 text-[14px] font-black text-slate-900 border-r-2 border-slate-900 align-middle">{order.quantity}</td>
                            <td className="pl-6 py-2 text-[14px] font-black uppercase text-slate-800 border-r-2 border-slate-900 align-middle">{order.combo}</td>
                            <td className="text-center py-2 text-[14px] font-black text-[#062c24] border-r-2 border-slate-900 tabular-nums align-middle">{order.time.slice(3)}</td>
                            <td className="pl-6 py-2 text-[11px] font-bold text-slate-600 align-middle whitespace-nowrap overflow-hidden text-ellipsis">
                              {order.observations || ''}
                            </td>
                          </tr>
                        ))}
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
