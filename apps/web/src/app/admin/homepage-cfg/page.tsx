import AdminShell from "@/components/admin/AdminShell";
import HomepageCarouselEditor from "@/components/admin/HomepageCarouselEditor";

export default function HomepageConfigPage() {
  return (
    <AdminShell
      title="homepage-cfg"
      description="Carica e seleziona le slide del carousel, configura timing testo/immagine e abbina alle immagini i campi testuali."
    >
      <HomepageCarouselEditor />
    </AdminShell>
  );
}
