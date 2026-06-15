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
    const member = await prisma.member.findFirst({
      where: { mobile: '7812860791' },
      include: { user: true }
    });
    console.log('Member Record:', JSON.stringify(member, null, 2));

    const user = await prisma.user.findFirst({
      where: { mobile: '7812860791' }
    });
    console.log('User Record:', JSON.stringify(user, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
