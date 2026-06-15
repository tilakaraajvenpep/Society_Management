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
    const updated = await prisma.tenant.updateMany({
      data: {
        enableForums: true
      }
    });
    console.log(`Successfully enabled forums for ${updated.count} tenant(s).`);

    const tenants = await prisma.tenant.findMany();
    console.log("Current tenants status:", tenants.map(t => ({ id: t.id, name: t.name, slug: t.slug, enableForums: t.enableForums })));
  } catch (err) {
    console.error("Error in enable-forums script:", err);
  }
}

main().finally(() => prisma.$disconnect());
