import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const container = await prisma.batchContainer.findUnique({
      where: { qrData: 'QR-2026-000001' },
      include: {
        scans: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        batch: true,
      },
    });
    console.log(container);
  } catch (e) {
    console.error(e);
  }
}
main();
