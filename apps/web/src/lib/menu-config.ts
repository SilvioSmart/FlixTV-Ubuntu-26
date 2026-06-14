export type MenuNode = {
  id: string;
  label: string;
  slug: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  children: MenuNode[];
};

export type MenuSaveItem = {
  id?: string;
  label: string;
  slug: string;
  href?: string;
  sortOrder: number;
  isActive: boolean;
  children: MenuSaveItem[];
};

export const DEFAULT_HOME_MENU: MenuNode[] = [
  {
    id: "default-sitcom",
    label: "sitcom",
    slug: "sitcom",
    href: "#sitcom",
    sortOrder: 10,
    isActive: true,
    children: [
      {
        id: "default-fuori-corso",
        label: "Fuori Corso",
        slug: "fuori-corso",
        href: "#fuori-corso",
        sortOrder: 10,
        isActive: true,
        children: []
      },
      {
        id: "default-bed-and-breakfast",
        label: "Bed&Breakfast",
        slug: "bed-and-breakfast",
        href: "#bed-and-breakfast",
        sortOrder: 20,
        isActive: true,
        children: []
      },
      {
        id: "default-tutti-a-casa",
        label: "Tutti a Casa",
        slug: "tutti-a-casa",
        href: "#tutti-a-casa",
        sortOrder: 30,
        isActive: true,
        children: []
      }
    ]
  },
  {
    id: "default-telegaribaldi",
    label: "telegaribaldi",
    slug: "telegaribaldi",
    href: "#telegaribaldi",
    sortOrder: 20,
    isActive: true,
    children: []
  },
  {
    id: "default-show",
    label: "show",
    slug: "show",
    href: "#show",
    sortOrder: 30,
    isActive: true,
    children: []
  },
  {
    id: "default-morning",
    label: "morning",
    slug: "morning",
    href: "#morning",
    sortOrder: 40,
    isActive: true,
    children: []
  },
  {
    id: "default-rubriche",
    label: "rubriche",
    slug: "rubriche",
    href: "#rubriche",
    sortOrder: 50,
    isActive: true,
    children: []
  },
  {
    id: "default-news",
    label: "news",
    slug: "news",
    href: "#news",
    sortOrder: 60,
    isActive: true,
    children: []
  },
  {
    id: "default-web-live",
    label: "web-live",
    slug: "web-live",
    href: "#web-live",
    sortOrder: 70,
    isActive: true,
    children: []
  }
];

export function slugifyMenuLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMenuHref(slug: string, href?: string | null) {
  const cleanHref = href?.trim();

  if (cleanHref) {
    return cleanHref;
  }

  return `#${slug}`;
}

export function sortMenuNodes<T extends { sortOrder: number; label: string }>(
  items: T[]
) {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.sortOrder !== secondItem.sortOrder) {
      return firstItem.sortOrder - secondItem.sortOrder;
    }

    return firstItem.label.localeCompare(secondItem.label);
  });
}

export function normalizeMenuForSave(items: MenuSaveItem[]): MenuSaveItem[] {
  return items.map((item, index) => {
    const label = item.label.trim() || "nuova voce";
    const slug = slugifyMenuLabel(item.slug || label) || `voce-${index + 1}`;

    return {
      id: item.id?.startsWith("temp-") ? undefined : item.id,
      label,
      slug,
      href: getMenuHref(slug, item.href),
      sortOrder: (index + 1) * 10,
      isActive: item.isActive,
      children: normalizeMenuForSave(item.children)
    };
  });
}
