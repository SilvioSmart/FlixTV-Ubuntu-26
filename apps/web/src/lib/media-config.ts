export type MediaStorageConfig = {
  uploadPath: string;
  convertedPath: string;
  thumbnailPath: string;
};

export type MediaFieldOption = {
  id?: string;
  fieldName: string;
  label: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
};

export type MediaConfig = {
  storage: MediaStorageConfig;
  fieldOptions: MediaFieldOption[];
};

export const MEDIA_FIELD_NAMES = [
  {
    label: "Categoria",
    value: "category"
  },
  {
    label: "Serie",
    value: "series"
  },
  {
    label: "Puntata",
    value: "episode"
  },
  {
    label: "Lingua",
    value: "language"
  },
  {
    label: "Rating",
    value: "rating"
  }
] as const;

export const DEFAULT_MEDIA_CONFIG: MediaConfig = {
  storage: {
    uploadPath: "/var/www/flixtv/storage/media/uploaded",
    convertedPath: "/var/www/flixtv/storage/media/hls",
    thumbnailPath: "/var/www/flixtv/storage/media/thumbnails"
  },
  fieldOptions: [
    {
      fieldName: "category",
      label: "Nove",
      value: "NOVE",
      sortOrder: 10,
      isActive: true
    },
    {
      fieldName: "category",
      label: "Real Time",
      value: "REAL_TIME",
      sortOrder: 20,
      isActive: true
    },
    {
      fieldName: "category",
      label: "DMAX",
      value: "DMAX",
      sortOrder: 30,
      isActive: true
    },
    {
      fieldName: "series",
      label: "Fuori Corso",
      value: "fuori-corso",
      sortOrder: 10,
      isActive: true
    },
    {
      fieldName: "series",
      label: "Bed&Breakfast",
      value: "bed-and-breakfast",
      sortOrder: 20,
      isActive: true
    },
    {
      fieldName: "series",
      label: "Tutti a Casa",
      value: "tutti-a-casa",
      sortOrder: 30,
      isActive: true
    },
    {
      fieldName: "language",
      label: "Italiano",
      value: "it",
      sortOrder: 10,
      isActive: true
    },
    {
      fieldName: "rating",
      label: "Per tutti",
      value: "all",
      sortOrder: 10,
      isActive: true
    }
  ]
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function normalizePath(value: unknown, fallback: string) {
  return isString(value) && value.trim() ? value.trim() : fallback;
}

function slugifyOptionValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeMediaConfig(value: unknown): MediaConfig {
  if (!value || typeof value !== "object") {
    return DEFAULT_MEDIA_CONFIG;
  }

  const config = value as Partial<MediaConfig>;
  const storage = config.storage && typeof config.storage === "object"
    ? config.storage as Partial<MediaStorageConfig>
    : {};
  const fieldOptions = Array.isArray(config.fieldOptions)
    ? config.fieldOptions
        .map((option, index): MediaFieldOption | null => {
          if (!option || typeof option !== "object") {
            return null;
          }

          const fieldOption = option as Partial<MediaFieldOption>;
          const fieldName = isString(fieldOption.fieldName)
            ? fieldOption.fieldName.trim()
            : "";
          const label = isString(fieldOption.label) ? fieldOption.label.trim() : "";
          const value = isString(fieldOption.value)
            ? fieldOption.value.trim()
            : slugifyOptionValue(label);

          if (!fieldName || !label || !value) {
            return null;
          }

          return {
            id:
              isString(fieldOption.id) && !fieldOption.id.startsWith("temp-")
                ? fieldOption.id
                : undefined,
            fieldName,
            label,
            value,
            sortOrder: (index + 1) * 10,
            isActive:
              typeof fieldOption.isActive === "boolean"
                ? fieldOption.isActive
                : true
          };
        })
        .filter((option): option is MediaFieldOption => Boolean(option))
    : DEFAULT_MEDIA_CONFIG.fieldOptions;

  return {
    storage: {
      uploadPath: normalizePath(
        storage.uploadPath,
        DEFAULT_MEDIA_CONFIG.storage.uploadPath
      ),
      convertedPath: normalizePath(
        storage.convertedPath,
        DEFAULT_MEDIA_CONFIG.storage.convertedPath
      ),
      thumbnailPath: normalizePath(
        storage.thumbnailPath,
        DEFAULT_MEDIA_CONFIG.storage.thumbnailPath
      )
    },
    fieldOptions
  };
}

export function getOptionsForField(config: MediaConfig, fieldName: string) {
  return config.fieldOptions
    .filter((option) => option.fieldName === fieldName && option.isActive)
    .toSorted((firstOption, secondOption) => {
      if (firstOption.sortOrder !== secondOption.sortOrder) {
        return firstOption.sortOrder - secondOption.sortOrder;
      }

      return firstOption.label.localeCompare(secondOption.label);
    });
}
