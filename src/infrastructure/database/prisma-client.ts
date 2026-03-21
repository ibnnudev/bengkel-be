import { PrismaClient } from "@prisma/client/extension";

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ["query", "error", "warn"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;