import "dotenv/config";
import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in .env before running Prisma commands.");
}

export default defineConfig({
  schema: "apps/api/prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL
  }
});
