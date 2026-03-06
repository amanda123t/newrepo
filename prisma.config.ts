import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const isPostgres = dbUrl.startsWith("postgresql") || dbUrl.startsWith("postgres");

export default defineConfig({
  schema: isPostgres
    ? path.join("prisma", "schema.prisma")
    : path.join("prisma", "schema.dev.prisma"),
  migrations: {
    path: isPostgres
      ? path.join("prisma", "migrations")
      : path.join("prisma", "migrations-dev"),
  },
  datasource: {
    url: dbUrl,
  },
});
