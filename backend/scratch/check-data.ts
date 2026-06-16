import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        maintenanceCosts: true
      }
    });
    console.log("TENANTS AND COSTS:");
    console.log(JSON.stringify(tenants, null, 2));

    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log("RECENT MEMBERS:");
    console.log(JSON.stringify(members, null, 2));
  } catch (err) {
    console.error("Error in check-data:", err);
  }
}

main().finally(() => prisma.$disconnect());
