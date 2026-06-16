require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const members = await prisma.member.findMany({
      include: {
        tenant: {
          include: {
            maintenanceCosts: true
          }
        }
      }
    });
    console.log('All Members:', JSON.stringify(members.map(m => ({ id: m.id, name: m.name, flatNo: m.flatNo, outstandingDues: m.outstandingDues, paidUntil: m.paidUntil, defaultTenure: m.defaultTenure })), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
