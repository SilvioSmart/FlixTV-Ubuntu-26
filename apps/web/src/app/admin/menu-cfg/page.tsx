"use client";

import { useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminShell from "@/components/admin/AdminShell";

type MenuItem = {
  label: string;
  slug: string;
  priority: number;
  children: string[];
};

const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    label: "sitcom",
    slug: "sitcom",
    priority: 10,
    children: ["Fuori Corso", "Bed&Breakfast", "Tutti a Casa"]
  },
  {
    label: "telegaribaldi",
    slug: "telegaribaldi",
    priority: 20,
    children: []
  },
  {
    label: "show",
    slug: "show",
    priority: 30,
    children: []
  },
  {
    label: "web-live",
    slug: "web-live",
    priority: 90,
    children: []
  }
];

export default function MenuConfigPage() {
  const [items, setItems] = useState(INITIAL_MENU_ITEMS);

  return (
    <AdminShell
      title="menu cfg"
      description="Crea le voci del menu, eventuali sottomenu e definisci l'ordine di priorita."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdminCard title="Voci menu" description="Ordinamento logico per priorita crescente.">
          <div className="space-y-3">
            {items
              .toSorted((a, b) => a.priority - b.priority)
              .map((item, index) => (
                <div key={item.slug} className="rounded-md border border-white/10 bg-black/35 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <GripVertical size={18} className="text-white/35" />
                    <input
                      value={item.label}
                      onChange={(event) => {
                        const nextItems = [...items];
                        nextItems[index] = {
                          ...item,
                          label: event.currentTarget.value
                        };
                        setItems(nextItems);
                      }}
                      className="h-10 flex-1 rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                    <input
                      type="number"
                      value={item.priority}
                      onChange={(event) => {
                        const nextItems = [...items];
                        nextItems[index] = {
                          ...item,
                          priority: Number(event.currentTarget.value)
                        };
                        setItems(nextItems);
                      }}
                      className="h-10 w-24 rounded-md border border-white/10 bg-black/50 px-3 text-sm font-bold text-white outline-none"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.children.map((child) => (
                      <span key={child} className="rounded bg-white/10 px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white/65">
                        {child}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </AdminCard>

        <AdminCard title="Nuova voce" description="Bozza locale pronta per collegamento a persistenza CMS.">
          <button
            type="button"
            onClick={() =>
              setItems((currentItems) => [
                ...currentItems,
                {
                  label: "nuova voce",
                  slug: `nuova-voce-${currentItems.length + 1}`,
                  priority: (currentItems.length + 1) * 10,
                  children: []
                }
              ])
            }
            className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-black uppercase tracking-[0.1em] text-black"
          >
            <Plus size={18} />
            Aggiungi
          </button>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
