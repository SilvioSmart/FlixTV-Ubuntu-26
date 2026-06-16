export type ProgramDetail = {
  id?: string;
  categoria: string;
  programma: string;
  serie: string;
  stagione: string;
  numeroPuntate: number;
};

export const DEFAULT_PROGRAMS: ProgramDetail[] = [
  {
    id: "default-fuori-corso",
    categoria: "Sitcom",
    programma: "Fuori Corso",
    serie: "Fuori Corso",
    stagione: "Stagione 1",
    numeroPuntate: 12
  },
  {
    id: "default-bed-and-breakfast",
    categoria: "Sitcom",
    programma: "Bed&Breakfast",
    serie: "Bed&Breakfast",
    stagione: "Stagione 1",
    numeroPuntate: 10
  },
  {
    id: "default-tutti-a-casa",
    categoria: "Sitcom",
    programma: "Tutti a Casa",
    serie: "Tutti a Casa",
    stagione: "Stagione 1",
    numeroPuntate: 8
  },
  {
    id: "default-telegaribaldi",
    categoria: "News",
    programma: "Telegaribaldi",
    serie: "Edizione quotidiana",
    stagione: "2026",
    numeroPuntate: 365
  }
];

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function normalizeProgram(value: unknown): ProgramDetail | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const program = value as Partial<ProgramDetail>;
  const categoria = isString(program.categoria) ? program.categoria.trim() : "";
  const programma = isString(program.programma) ? program.programma.trim() : "";
  const serie = isString(program.serie) ? program.serie.trim() : "";
  const stagione = isString(program.stagione) ? program.stagione.trim() : "";

  if (!categoria || !programma || !serie || !stagione) {
    return null;
  }

  return {
    id:
      isString(program.id) && !program.id.startsWith("temp-") && !program.id.startsWith("default-")
        ? program.id
        : undefined,
    categoria,
    programma,
    serie,
    stagione,
    numeroPuntate: isNumber(program.numeroPuntate)
      ? Math.max(0, Math.round(program.numeroPuntate))
      : 0
  };
}

export function normalizePrograms(value: unknown): ProgramDetail[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeProgram)
    .filter((program): program is ProgramDetail => Boolean(program));
}

export function uniqueValues(programs: ProgramDetail[], key: keyof ProgramDetail) {
  return Array.from(
    new Set(
      programs
        .map((program) => program[key])
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  ).sort((firstValue, secondValue) => firstValue.localeCompare(secondValue));
}
