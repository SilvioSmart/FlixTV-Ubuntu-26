import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";

const EPG_ROWS = [
  ["FlixTV Live", "https://example.com/live/master.m3u8", "Attivo"],
  ["Web Live", "https://example.com/web-live/master.m3u8", "Bozza"]
];

export default function LiveEpgConfigPage() {
  return (
    <AdminShell
      title="live/epg cfg"
      description="Configura moduli live, stream HLS e slider del palinsesto EPG."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminCard title="Canali live">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                <tr>
                  <th className="pb-3">Canale</th>
                  <th className="pb-3">Stream URL</th>
                  <th className="pb-3">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {EPG_ROWS.map(([name, url, status]) => (
                  <tr key={name}>
                    <td className="py-3 font-bold text-white">{name}</td>
                    <td className="py-3 text-white/55">{url}</td>
                    <td className="py-3 text-white/70">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard title="Nuovo slot EPG">
          <div className="space-y-3">
            {["Titolo programma", "Descrizione", "Inizio", "Fine"].map((label) => (
              <label key={label} className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">{label}</span>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 text-sm text-white outline-none" />
              </label>
            ))}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
