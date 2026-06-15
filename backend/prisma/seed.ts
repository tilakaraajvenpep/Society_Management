import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import prisma from "../src/utils/prisma";

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create Super Admin if not exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "superadmin@example.com", role: "SUPER_ADMIN" }
  });

  let superAdmin;
  if (!existingAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        email: "superadmin@example.com",
        password: hashedPassword,
        name: "Platform Admin",
        role: "SUPER_ADMIN",
        tenantId: undefined, // Explicitly undefined for global
      },
    });
    console.log("Super Admin created:", superAdmin.email);
  } else {
    superAdmin = existingAdmin;
    console.log("Super Admin already exists:", superAdmin.email);
  }

  // Create Sample Tenant if not exists
  let tenant = await prisma.tenant.findFirst({
    where: { name: "Sunrise Apartments" }
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "Sunrise Apartments",
        address: "123 Sunshine Street",
        billingCycle: "MONTHLY",
        maintenanceAmount: 2500,
        slug: "sunrise", // Add slug
        enableForums: true,
      },
    });
    console.log("Sample Tenant created:", tenant.name);

    // Create Tenant Admin
    const tenantAdmin = await prisma.user.create({
      data: {
        email: "treasurer@sunrise.com",
        password: hashedPassword,
        name: "John Doe",
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
      },
    });
    console.log("Tenant Admin created:", tenantAdmin.email);
  } else {
    console.log("Sample Tenant already exists:", tenant.name);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
