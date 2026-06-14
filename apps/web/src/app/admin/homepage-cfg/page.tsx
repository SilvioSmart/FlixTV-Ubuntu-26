import AdminShell from "@/components/admin/AdminShell";
import HomeConfigEditor from "@/components/admin/HomeConfigEditor";

export default function HomepageConfigPage() {
  return (
    <AdminShell
      title="homepage-cfg"
      description="Carica e seleziona le slide del carousel, configura timing testo/immagine e abbina alle immagini i campi testuali."
    >
      <HomeConfigEditor />
    </AdminShell>
  );
}
