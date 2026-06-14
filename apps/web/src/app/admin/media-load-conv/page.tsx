"use client";

import { useState } from "react";
import { FileVideo, UploadCloud } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";

export default function MediaLoadConversionPage() {
  const [progress, setProgress] = useState(0);

  function simulateConversion() {
    setProgress(0);
    const intervalId = window.setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 100) {
          window.clearInterval(intervalId);
          return 100;
        }

        return currentProgress + 10;
      });
    }, 260);
  }

  return (
    <AdminShell
      title="media load/conv"
      description="Caricamento media, compilazione info database e conversione in file HLS con avanzamento grafico."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminCard title="Caricamento media" description="Interfaccia pronta per collegamento storage e pipeline HLS.">
          <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/35 p-8 text-center transition hover:bg-white/[0.04]">
            <UploadCloud size={42} className="text-white/55" />
            <span className="mt-4 text-lg font-black text-white">Seleziona video sorgente</span>
            <span className="mt-2 text-sm text-white/55">MP4, MOV, MXF o file mezzanine</span>
            <input type="file" accept="video/*" className="sr-only" />
          </label>
        </AdminCard>

        <AdminCard title="Metadati contenuto">
          <div className="space-y-3">
            {["Titolo", "Serie", "Puntata", "Categoria", "Durata"].map((label) => (
              <label key={label} className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">{label}</span>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none" />
              </label>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Conversione HLS" description="Stato grafico di avanzamento encoding e packaging." >
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={simulateConversion}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black"
          >
            <FileVideo size={18} />
            Avvia conversione
          </button>
          <span className="text-sm font-bold text-white/60">{progress}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-stream-red transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </AdminCard>
    </AdminShell>
  );
}
