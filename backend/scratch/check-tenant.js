const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: {
      maintenanceCosts: true
    }
  });
  console.log("TENANTS AND COSTS:");
  console.log(JSON.stringify(tenants, null, 2));

  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log("RECENT MEMBERS:");
  console.log(JSON.stringify(members, null, 2));
}

main().finally(() => prisma.$disconnect());
