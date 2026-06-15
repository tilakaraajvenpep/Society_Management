require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const passwordToSet = "7812860791";
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);
    const user = await prisma.user.updateMany({
      where: { mobile: '7812860791' },
      data: { password: hashedPassword }
    });
    console.log('Successfully updated password for', user.count, 'user(s) to:', passwordToSet);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
