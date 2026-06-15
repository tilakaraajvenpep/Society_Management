require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/society_management";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function addSampleMember() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Find the Sunrise Apartments tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: "sunrise" }
    });

    if (!tenant) {
      console.error("Sunrise Apartments tenant not found! Please seed the DB first.");
      return;
    }

    // Check if the member user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: "member@sunrise.com", role: "MEMBER" }
    });

    if (existingUser) {
      console.log("Member user already exists:", existingUser.email);
      return;
    }

    // Create the User record
    const user = await prisma.user.create({
      data: {
        email: "member@sunrise.com",
        password: hashedPassword,
        name: "Ramesh Kumar",
        role: "MEMBER",
        tenantId: tenant.id,
      }
    });

    // Create the Member record linked to the User
    const member = await prisma.member.create({
      data: {
        name: "Ramesh Kumar",
        email: "member@sunrise.com",
        mobile: "9876543210",
        flatNo: "A-101",
        outstandingDues: 5000,
        tenantId: tenant.id,
        userId: user.id,
      }
    });

    console.log("Successfully created sample member profile and login user!");
    console.log(`Email: member@sunrise.com`);
    console.log(`Password: admin123`);
    console.log(`Flat: A-101`);
  } catch (err) {
    console.error("Error creating member:", err);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleMember();
