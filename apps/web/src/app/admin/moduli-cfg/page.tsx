import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";
import ModulesConfigEditor from "@/components/admin/ModulesConfigEditor";

export default function ModulesConfigPage() {
  return (
    <AdminShell
      title="moduli cfg"
      description="Configura titolo, sottotitolo, query media e ordine dei moduli che compongono il body."
    >
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <AdminCard
          title="Query media"
          description="Abbina categoria, ricerca, limite e ordinamento ai contenuti di ogni modulo."
        />
        <AdminCard
          title="Drag and drop"
          description="Trascina i moduli per definire la sequenza del body homepage."
        />
        <AdminCard
          title="Pubblicazione"
          description="Le modifiche restano in bozza fino al salvataggio."
        />
      </div>
      <ModulesConfigEditor />
    </AdminShell>
  );
}
