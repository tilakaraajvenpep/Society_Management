import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Public endpoint for tenant detection
router.get("/public/:slug", async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, name: true, slug: true, status: true }
    });
    
    if (!tenant || tenant.status !== "ACTIVE") {
      return res.status(404).json({ message: "Tenant not found or inactive" });
    }
    
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tenant info", error });
  }
});

router.use(authenticate);

// Super Admin only
router.get("/", authorize(["SUPER_ADMIN"]), async (req, res) => {
  const tenants = await prisma.tenant.findMany({
    include: { users: { where: { role: "TENANT_ADMIN" } } },
  });
  res.json(tenants);
});

router.post("/", authorize(["SUPER_ADMIN"]), async (req, res) => {
  const { name, address, billingCycle, maintenanceAmount, adminEmail, adminName, adminPassword, slug, subscriptionAmount, lastRenewalDate, nextRenewalDate, enableForums } = req.body;
  try {
    const tenantSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const tenant = await prisma.tenant.create({
      data: { 
        name, 
        address, 
        slug: tenantSlug,
        billingCycle, 
        maintenanceAmount: maintenanceAmount || 0,
        enableForums: !!enableForums,
        subscriptionAmount: subscriptionAmount || 0,
        lastRenewalDate: lastRenewalDate ? new Date(lastRenewalDate) : null,
        nextRenewalDate: nextRenewalDate ? new Date(nextRenewalDate) : null,
      },
    });

    // Create Admin User for this tenant
    const hashedPassword = await bcrypt.hash(adminPassword || "admin123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
      },
    });

    res.status(201).json(tenant);
  } catch (error) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: "Error creating tenant", error });
  }
});

router.patch("/settings", authenticate, authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { maintenanceAmount, billingCycle, quarterlyAmount, halfYearlyAmount, annualAmount, enableForums } = req.body;
  try {
    const tenant = await prisma.tenant.update({
      where: { id: req.user.tenantId as string },
      data: { 
        maintenanceAmount: maintenanceAmount !== undefined ? parseFloat(maintenanceAmount.toString()) : undefined,
        billingCycle: billingCycle,
        quarterlyAmount: quarterlyAmount !== undefined ? (quarterlyAmount === null || quarterlyAmount === "" ? null : parseFloat(quarterlyAmount.toString())) : undefined,
        halfYearlyAmount: halfYearlyAmount !== undefined ? (halfYearlyAmount === null || halfYearlyAmount === "" ? null : parseFloat(halfYearlyAmount.toString())) : undefined,
        annualAmount: annualAmount !== undefined ? (annualAmount === null || annualAmount === "" ? null : parseFloat(annualAmount.toString())) : undefined,
        enableForums: enableForums !== undefined ? !!enableForums : undefined,
      },
    });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Error updating settings", error });
  }
});

router.patch("/:id", authenticate, authorize(["SUPER_ADMIN"]), async (req, res) => {
  const { name, address, billingCycle, status, adminPassword, adminName, adminEmail, slug, subscriptionAmount, lastRenewalDate, nextRenewalDate, enableForums } = req.body;
  try {
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id as string },
      data: { 
        name, 
        address, 
        billingCycle, 
        status, 
        slug,
        enableForums: enableForums !== undefined ? !!enableForums : undefined,
        subscriptionAmount: subscriptionAmount ? parseFloat(subscriptionAmount.toString()) : undefined,
        lastRenewalDate: lastRenewalDate ? new Date(lastRenewalDate) : undefined,
        nextRenewalDate: nextRenewalDate ? new Date(nextRenewalDate) : undefined,
      },
    });

    // Update Admin User details if provided
    if (adminName || adminEmail || adminPassword) {
      const updateData: any = {};
      if (adminName) updateData.name = adminName;
      if (adminEmail) updateData.email = adminEmail;
      
      if (adminPassword) {
        updateData.password = await bcrypt.hash(adminPassword, 10);
      }

      await prisma.user.updateMany({
        where: { tenantId: req.params.id as string, role: "TENANT_ADMIN" },
        data: updateData,
      });
    }

    res.json(tenant);
  } catch (error) {
    console.error("Error updating tenant:", error);
    res.status(500).json({ message: "Error updating tenant", error });
  }
});

router.patch("/:id/toggle-status", authenticate, authorize(["SUPER_ADMIN"]), async (req, res) => {
  try {
    const current = await prisma.tenant.findUnique({ where: { id: req.params.id as string } });
    const newStatus = current?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id as string },
      data: { status: newStatus },
    });
    res.json(tenant);
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ message: "Error toggling status", error });
  }
});

router.delete("/:id", authorize(["SUPER_ADMIN"]), async (req, res) => {
  try {
    await prisma.tenant.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Tenant deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tenant", error });
  }
});

router.get("/logs", authenticate, authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { timestamp: "desc" },
      take: 50
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error });
  }
});

router.get("/maintenance-costs", authenticate, authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  try {
    const costs = await prisma.maintenanceCost.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { financialYear: "asc" }
    });
    res.json(costs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching maintenance costs", error });
  }
});

router.post("/maintenance-costs", authenticate, authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { financialYear, amount } = req.body;
  if (!financialYear || amount === undefined || amount === null) {
    return res.status(400).json({ message: "Financial year and amount are required" });
  }
  try {
    const cost = await prisma.maintenanceCost.upsert({
      where: {
        tenantId_financialYear: {
          tenantId: req.user.tenantId,
          financialYear
        }
      },
      update: {
        amount: parseFloat(amount.toString())
      },
      create: {
        tenantId: req.user.tenantId,
        financialYear,
        amount: parseFloat(amount.toString())
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: req.user.tenantId,
        actionType: "MAINTENANCE_COST_SETUP",
        performedBy: req.user.name,
        details: `Set maintenance cost for financial year ${financialYear} to ₹${amount}`
      }
    });

    res.json(cost);
  } catch (error) {
    res.status(500).json({ message: "Error setting up maintenance cost", error });
  }
});

export default router;
