import { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/cors";
import {
  getDefaultHomepageSlides,
  normalizeHomepageSlides,
  type HomepageSlideRecord
} from "@/lib/homepage-slides";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "flixtv_admin_auth";

function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "flixtv-admin-session";
}

function isAdminRequest(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === getAdminToken();
}

function serializeSlide(slide: {
  id: string;
  title: string;
  subtitle: string | null;
  notes: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
  secondaryLinkLabel: string | null;
  notesColor: string;
  buttonTextColor: string;
  buttonBgColor: string;
  imageEffectMs: number;
  textEffectMs: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): HomepageSlideRecord {
  return {
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle ?? undefined,
    notes: slide.notes ?? undefined,
    imageUrl: slide.imageUrl,
    linkUrl: slide.linkUrl ?? undefined,
    linkLabel: slide.linkLabel ?? undefined,
    secondaryLinkLabel: slide.secondaryLinkLabel ?? undefined,
    notesColor: slide.notesColor,
    buttonTextColor: slide.buttonTextColor,
    buttonBgColor: slide.buttonBgColor,
    imageEffectMs: slide.imageEffectMs,
    textEffectMs: slide.textEffectMs,
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
    createdAt: slide.createdAt.toISOString(),
    updatedAt: slide.updatedAt.toISOString()
  };
}

export function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  const includeInactive = request.nextUrl.searchParams.get("scope") === "admin";

  try {
    const slides = await prisma.homepageSlide.findMany({
      where: includeInactive
        ? undefined
        : {
            isActive: true
          },
      orderBy: [
        {
          sortOrder: "asc"
        },
        {
          createdAt: "asc"
        }
      ]
    });

    const serializedSlides = slides.map(serializeSlide);

    return corsJson(request, {
      slides:
        serializedSlides.length > 0
          ? serializedSlides
          : getDefaultHomepageSlides()
    });
  } catch {
    return corsJson(request, {
      slides: getDefaultHomepageSlides()
    });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return corsJson(
      request,
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return corsJson(
      request,
      {
        error: "Invalid JSON body"
      },
      {
        status: 400
      }
    );
  }

  const rawSlides =
    body && typeof body === "object" && "slides" in body
      ? (body as { slides: unknown }).slides
      : body;
  const slides = normalizeHomepageSlides(rawSlides);

  if (slides.length === 0) {
    return corsJson(
      request,
      {
        error: "At least one valid homepage slide is required"
      },
      {
        status: 400
      }
    );
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.homepageSlide.deleteMany();

    for (const slide of slides) {
      await transaction.homepageSlide.create({
        data: {
          title: slide.title,
          subtitle: slide.subtitle,
          notes: slide.notes,
          imageUrl: slide.imageUrl,
          linkUrl: slide.linkUrl,
          linkLabel: slide.linkLabel,
          secondaryLinkLabel: slide.secondaryLinkLabel,
          notesColor: slide.notesColor,
          buttonTextColor: slide.buttonTextColor,
          buttonBgColor: slide.buttonBgColor,
          imageEffectMs: slide.imageEffectMs,
          textEffectMs: slide.textEffectMs,
          sortOrder: slide.sortOrder,
          isActive: slide.isActive
        }
      });
    }
  });

  const savedSlides = await prisma.homepageSlide.findMany({
    orderBy: [
      {
        sortOrder: "asc"
      },
      {
        createdAt: "asc"
      }
    ]
  });

  return corsJson(request, {
    slides: savedSlides.map(serializeSlide)
  });
}
