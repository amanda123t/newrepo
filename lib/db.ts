import { PrismaClient } from "@prisma/client";

// Auto-detect database type based on DATABASE_URL.
// Fallback to SQLite when DATABASE_URL is not set (desenvolvimento local).
const DATABASE_URL =
  process.env.DATABASE_URL ??
  (process.env.NODE_ENV === "production" ? undefined : "file:./dev.db");

export const isSQLite =
  !DATABASE_URL ||
  DATABASE_URL.startsWith("file:") ||
  DATABASE_URL.startsWith("sqlite:");

// ============================================================
// SQLite JSON-array middleware
// SQLite doesn't support native arrays — stored as JSON strings.
// Middleware converts transparently on all reads and writes.
// ============================================================
const JSON_ARRAY_FIELDS: Record<string, string[]> = {
  Client: ["teamMembers"],
  Process: ["systemsUsed"],
  ProcessAnalysis: ["problems"],
};

function stringifyArrays(model: string, data: Record<string, unknown>) {
  const fields = JSON_ARRAY_FIELDS[model];
  if (!fields || !data) return;
  for (const field of fields) {
    if (Array.isArray(data[field])) {
      data[field] = JSON.stringify(data[field]);
    }
  }
}

function parseArraysDeep(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach(parseArraysDeep);
    return;
  }
  const record = obj as Record<string, unknown>;
  // Parse all known JSON-array fields (handles nested includes automatically)
  for (const fields of Object.values(JSON_ARRAY_FIELDS)) {
    for (const field of fields) {
      if (typeof record[field] === "string") {
        try {
          record[field] = JSON.parse(record[field] as string);
        } catch {
          record[field] = [];
        }
      }
    }
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      parseArraysDeep(value);
    }
  }
}

// ============================================================
// Prisma Client singleton
// ============================================================
function createPrismaClient(): PrismaClient {
  // Prisma v7: datasourceUrl passed to constructor (url removed from schema files)
  const client = new PrismaClient({
    datasourceUrl: DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (isSQLite) {
    // Transparent JSON<->array conversion for SQLite
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error — $use deprecated in v5+ but still functional in Prisma v7
    client.$use(async (params: any, next: any) => {
      const model: string | undefined = params.model;
      const action: string = params.action;

      // Before write: stringify array fields
      if (model && JSON_ARRAY_FIELDS[model]) {
        if (["create", "update"].includes(action) && params.args?.data) {
          stringifyArrays(model, params.args.data);
        }
        if (action === "upsert") {
          if (params.args?.create) stringifyArrays(model, params.args.create);
          if (params.args?.update) stringifyArrays(model, params.args.update);
        }
        if (action === "createMany" && Array.isArray(params.args?.data)) {
          (params.args.data as Record<string, unknown>[]).forEach((item) =>
            stringifyArrays(model, item)
          );
        }
      }

      const result = await next(params);

      // After read: parse JSON strings back to arrays (deep — handles includes)
      if (result) parseArraysDeep(result);

      return result;
    });
  }

  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
