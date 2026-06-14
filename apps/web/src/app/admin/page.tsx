import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";

const DASHBOARD_ITEMS = [
  {
    title: "menu cfg",
    description: "Crea voci di menu, sottomenu e ordine di priorita.",
    href: "/admin/menu-cfg"
  },
  {
    title: "homepage-cfg",
    description: "Configura carousel fullscreen, immagini, testi, timing e moduli homepage.",
    href: "/admin/homepage-cfg"
  },
  {
    title: "moduli cfg",
    description: "Duplica, escludi e ordina i blocchi che compongono il body.",
    href: "/admin/moduli-cfg"
  },
  {
    title: "media load/conv",
    description: "Carica media, compila metadati e monitora conversioni HLS.",
    href: "/admin/media-load-conv"
  },
  {
    title: "live/epg cfg",
    description: "Configura live, canali e slider palinsesto EPG.",
    href: "/admin/live-epg-cfg"
  }
];

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Dashboard CMS"
      description="Backoffice di configurazione per frontend, contenuti, moduli e palinsesto FlixTV."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DASHBOARD_ITEMS.map((item) => (
          <a key={item.href} href={item.href} className="block">
            <AdminCard title={item.title} description={item.description}>
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-white/45">
                Apri configurazione
              </span>
            </AdminCard>
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
