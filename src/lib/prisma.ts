import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "";

  const baseClient = url.startsWith('prisma+')
    ? new PrismaClient({ accelerateUrl: url })
    : new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: url })) });

  const extendedClient = baseClient.$extends(withAccelerate());
  return extendedClient;
}

export const prisma = (globalForPrisma.prisma ?? createPrismaClient()) as any;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
