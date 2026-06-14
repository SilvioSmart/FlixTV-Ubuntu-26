import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";
import HomeConfigEditor from "@/components/admin/HomeConfigEditor";

export default function ModulesConfigPage() {
  return (
    <AdminShell
      title="moduli cfg"
      description="Costruisci il body della piattaforma escludendo, duplicando e ordinando i moduli."
    >
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <AdminCard title="Duplica modulo" description="Copia un blocco video-gallery cambiando id e titolo nel JSON." />
        <AdminCard title="Escludi modulo" description="Imposta `isEnabled: false` sul modulo da nascondere." />
        <AdminCard title="Ordina body" description="Sposta gli oggetti dentro `modules` nell'ordine desiderato." />
      </div>
      <HomeConfigEditor />
    </AdminShell>
  );
}
