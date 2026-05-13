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
  Handshake,
  UserCheck,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { cn } from '@/lib/utils';

interface HandoverItem {
  id: string;
  description: string;
  quantity: string;
  observations: string;
}

interface HandoverReportDialogProps {
  items: HandoverItem[];
  unitBrand?: string;
  unitNumber?: string;
  deliveryName?: string;
  receiverName?: string;
}

export function HandoverReportDialog({
  items,
  unitBrand = '',
  unitNumber = '',
  deliveryName = '',
  receiverName = '',
}: HandoverReportDialogProps) {
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

  const activeItems = items.filter((item) => {
    const qty = parseInt(item.quantity);
    return (!isNaN(qty) && qty > 0) || (item.observations && item.observations.trim().length > 0);
  });

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

      localStorage.setItem('contraloria_gc_traspaso_v3_final_reported', 'true');

      const link = document.createElement('a');
      link.download = `TRASPASO-${unitBrand}-${unitNumber}.jpg`;
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
          <Button className="w-full h-14 font-black gap-3 text-lg shadow-xl hover:scale-[1.01] transition-transform uppercase bg-emerald-600 hover:bg-emerald-700 text-white">
            <FileCheck className="h-6 w-6" />
            GENERAR REPORTE
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[98vw] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col h-[95vh]">
          <DialogHeader className="p-3 bg-slate-900 text-white shrink-0 no-print flex flex-row items-center justify-between space-y-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-emerald-400" />
              <DialogTitle className="font-black uppercase tracking-widest text-[10px]">Vista Previa Traspaso</DialogTitle>
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
                <div className="bg-emerald-600 text-white py-8 flex flex-col items-center gap-3 shrink-0">
                  <ShieldCheck className="h-10 w-10 text-white/80" strokeWidth={1.5} />
                  <h1 className="font-black uppercase tracking-widest text-3xl text-center leading-tight">
                    TRASPASO DE ADMINISTRACIÓN
                  </h1>
                  <div className="inline-flex items-center justify-center min-w-[260px] py-2 rounded-full border-2 border-white/30 bg-white/10 whitespace-nowrap px-6">
                    <span className="font-black text-2xl uppercase tracking-[0.1em] text-white">
                      {unitBrand.toUpperCase()} #{unitNumber || '00'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 flex flex-col pb-12">
                  <div className="grid grid-cols-2 gap-0 bg-slate-50 rounded-[1.5rem] border-2 border-slate-900 shadow-xl overflow-hidden shrink-0">
                    <div className="py-4 space-y-1 flex flex-col items-center border-r-2 border-slate-900">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <UserCheck className="h-4 w-4" />
                        <p className="text-[14px] font-black uppercase tracking-[0.15em]">Entrega:</p>
                      </div>
                      <p className="text-xl font-black text-slate-900 uppercase text-center px-4">
                        {deliveryName || '---'}
                      </p>
                    </div>
                    <div className="py-4 space-y-1 flex flex-col items-center">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <UserPlus className="h-4 w-4" />
                        <p className="text-[14px] font-black uppercase tracking-[0.15em]">Recibe:</p>
                      </div>
                      <p className="text-xl font-black text-slate-900 uppercase text-center px-4">
                        {receiverName || '---'}
                      </p>
                    </div>
                  </div>

                  <div className="border-2 border-slate-900 rounded-[1.5rem] overflow-hidden shadow-xl shrink-0">
                    <table className="w-full border-collapse table-fixed">
                      <thead className="bg-slate-100 border-b-2 border-slate-900">
                        <tr>
                          <th className="w-[10%] font-black uppercase tracking-widest text-slate-500 py-3 text-center border-r-2 border-slate-900">CANT</th>
                          <th className="w-[40%] font-black uppercase tracking-widest text-slate-500 py-3 pl-6 text-left border-r-2 border-slate-900">EQUIPO</th>
                          <th className="w-[50%] font-black uppercase tracking-widest text-slate-500 py-3 pl-6 text-left">OBSERVACIONES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeItems.map((item, index) => (
                          <tr key={item.id} className={cn(index % 2 === 1 ? 'bg-slate-50/30' : 'bg-white')}>
                            <td className="font-black text-lg text-center text-emerald-700 py-2 border-r-2 border-slate-900 align-middle">{item.quantity || '0'}</td>
                            <td className="text-[14px] uppercase font-black text-slate-800 py-2 pl-6 border-r-2 border-slate-900 align-middle">{item.description}</td>
                            <td className="text-[13px] text-slate-500 font-bold italic py-2 pl-6 align-middle">
                              {item.observations || ''}
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
