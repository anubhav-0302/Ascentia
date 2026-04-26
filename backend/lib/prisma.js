import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../dev.db");

let prisma;
try {
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  prisma = new PrismaClient({ adapter });
  console.log('✅ Prisma client initialized');
} catch (error) {
  console.error('❌ Failed to initialize Prisma:', error.message);
  throw error;
}

export default prisma;
