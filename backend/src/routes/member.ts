import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

router.use(authenticate);

// Member Profile (for logged in members)
router.get("/profile", authorize(["MEMBER"]), async (req: any, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.user.id },
      include: { 
        tenant: {
          include: {
            maintenanceCosts: {
              orderBy: { financialYear: 'asc' }
            }
          }
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 50 // Limit to last 50 receipts
        },
        subscriptions: {
          orderBy: { dueDate: 'desc' }
        }
      }
    });
    
    if (!member) {
      return res.status(404).json({ message: "Member profile not found" });
    }
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
});

function getFinancialYearForDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${endYear.toString().padStart(2, '0')}`;
}

async function calculateDues(
  tx: any,
  tenantId: string,
  paidUntilStr: string,
  defaultTenure: string
): Promise<number> {
  if (!paidUntilStr) return 0;
  
  const [year, month, day] = paidUntilStr.split('-').map(Number);
  const activeDate = new Date(Date.UTC(year, month - 1, day));
  
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  
  if (activeDate > todayUTC) {
    return 0;
  }
  
  // Fetch all maintenance costs for this tenant
  const tenantCosts = await tx.maintenanceCost.findMany({
    where: { tenantId }
  });
  
  const tenant = await tx.tenant.findUnique({
    where: { id: tenantId }
  });
  const defaultAmount = tenant?.maintenanceAmount || 0;
  
  const getRateForDate = (date: Date, tenure: string): number => {
    const fy = getFinancialYearForDate(date);
    const costRecord = tenantCosts.find((c: any) => c.financialYear === fy);
    const annualCost = costRecord ? costRecord.amount : (defaultAmount * 12);
    
    if (tenure === "ANNUAL") {
      return annualCost;
    } else if (tenure === "QUARTERLY") {
      return annualCost / 4;
    } else if (tenure === "HALF_YEARLY") {
      return annualCost / 2;
    } else {
      // MONTHLY
      return annualCost / 12;
    }
  };

  let totalDues = 0;
  
  if (defaultTenure === "ANNUAL") {
    const startFYYear = activeDate.getUTCMonth() >= 3 ? activeDate.getUTCFullYear() : activeDate.getUTCFullYear() - 1;
    const endFYYear = todayUTC.getUTCMonth() >= 3 ? todayUTC.getUTCFullYear() : todayUTC.getUTCFullYear() - 1;
    
    for (let y = startFYYear; y <= endFYYear; y++) {
      const fyDate = new Date(Date.UTC(y, 3, 1));
      totalDues += getRateForDate(fyDate, "ANNUAL");
    }
  } else if (defaultTenure === "QUARTERLY") {
    const yearsDiff = todayUTC.getUTCFullYear() - activeDate.getUTCFullYear();
    const monthsDiff = todayUTC.getUTCMonth() - activeDate.getUTCMonth();
    let totalMonths = yearsDiff * 12 + monthsDiff;
    if (todayUTC.getUTCDate() >= activeDate.getUTCDate()) {
      totalMonths += 1;
    }
    
    const totalQuarters = Math.ceil(totalMonths / 3);
    for (let q = 0; q < totalQuarters; q++) {
      const qDate = new Date(activeDate);
      qDate.setUTCMonth(activeDate.getUTCMonth() + q * 3);
      totalDues += getRateForDate(qDate, "QUARTERLY");
    }
  } else if (defaultTenure === "HALF_YEARLY") {
    const yearsDiff = todayUTC.getUTCFullYear() - activeDate.getUTCFullYear();
    const monthsDiff = todayUTC.getUTCMonth() - activeDate.getUTCMonth();
    let totalMonths = yearsDiff * 12 + monthsDiff;
    if (todayUTC.getUTCDate() >= activeDate.getUTCDate()) {
      totalMonths += 1;
    }
    
    const totalHalfYears = Math.ceil(totalMonths / 6);
    for (let h = 0; h < totalHalfYears; h++) {
      const hDate = new Date(activeDate);
      hDate.setUTCMonth(activeDate.getUTCMonth() + h * 6);
      totalDues += getRateForDate(hDate, "HALF_YEARLY");
    }
  } else {
    // MONTHLY
    const yearsDiff = todayUTC.getUTCFullYear() - activeDate.getUTCFullYear();
    const monthsDiff = todayUTC.getUTCMonth() - activeDate.getUTCMonth();
    let totalMonths = yearsDiff * 12 + monthsDiff;
    if (todayUTC.getUTCDate() >= activeDate.getUTCDate()) {
      totalMonths += 1;
    }
    
    for (let m = 0; m < totalMonths; m++) {
      const mDate = new Date(activeDate);
      mDate.setUTCMonth(activeDate.getUTCMonth() + m);
      totalDues += getRateForDate(mDate, "MONTHLY");
    }
  }
  
  return totalDues;
}

// Tenant Admin only
router.get("/", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const members = await prisma.member.findMany({
    where: { tenantId: req.user.tenantId },
  });
  res.json(members);
});

router.post("/", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { name, email, mobile, flatNo, address, outstandingDues, password, enableLogin, defaultTenure, paidUntil, initialPaymentAmount, initialPaymentMode, initialPaymentNotes, photoUrl, idProofUrl, createdAt } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      let userId = undefined;
      
      console.log("Checking existing user (isolated) for:", { email, mobile, tenantId: req.user.tenantId });
      // Check if user already exists IN THIS TENANT ONLY
      let existingUser = null;
      if (email && email.trim() !== "") {
        existingUser = await tx.user.findUnique({ 
          where: { 
            email_tenantId: { 
              email: email.toLowerCase().trim(), 
              tenantId: req.user.tenantId 
            } 
          } 
        });
      }
      if (!existingUser && mobile && mobile.trim() !== "") {
        existingUser = await tx.user.findUnique({ 
          where: { 
            mobile_tenantId: { 
              mobile: mobile.trim(), 
              tenantId: req.user.tenantId 
            } 
          } 
        });
      }

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const fallbackPassword = mobile ? mobile.trim() : "123456";
        const passwordToHash = (password && password.trim() !== "") ? password : fallbackPassword;
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);
        const user = await tx.user.create({
          data: {
            name,
            email: email || undefined,
            mobile: mobile || undefined,
            password: hashedPassword,
            role: "MEMBER",
            tenantId: req.user.tenantId,
          }
        });
        userId = user.id;
      }
      const additionalDues = await calculateDues(tx, req.user.tenantId, paidUntil, defaultTenure);
      const inputDues = outstandingDues ? parseFloat(outstandingDues.toString()) : 0;
      const totalOutstandingDues = inputDues + additionalDues;

      const member = await tx.member.create({
        data: {
          name,
          email,
          mobile,
          flatNo,
          address,
          outstandingDues: totalOutstandingDues,
          tenantId: req.user.tenantId,
          userId,
          defaultTenure: defaultTenure || "MONTHLY",
          paidUntil: paidUntil ? new Date(paidUntil) : null,
          photoUrl,
          idProofUrl,
          createdAt: createdAt ? new Date(createdAt) : undefined,
        },
      });

      // Handle initial payment (Corpus Fund, Setup Fee, etc)
      if (initialPaymentAmount && parseFloat(initialPaymentAmount) > 0) {
        const pCount = await tx.payment.count({ where: { tenantId: req.user.tenantId } });
        const receiptNumber = `REC-${(pCount + 1).toString().padStart(4, '0')}`;
        const mode = initialPaymentMode || 'CASH';
        
        await tx.payment.create({
          data: {
            memberId: member.id,
            amount: parseFloat(initialPaymentAmount.toString()),
            mode: mode as any,
            notes: initialPaymentNotes || "Onboarding Setup / Corpus Fund",
            tenantId: req.user.tenantId,
            collectedById: req.user.id,
            receiptNumber,
            handoverStatus: mode === "CASH" ? "WITH_COLLECTOR" : "TRANSFERRED_TO_BANK",
            periodLabel: "Initial Onboarding Fee",
          }
        });

        if (mode === "CASH") {
          await tx.cashBalance.upsert({
            where: { userId: req.user.id },
            update: { balance: { increment: parseFloat(initialPaymentAmount.toString()) } },
            create: { userId: req.user.id, balance: parseFloat(initialPaymentAmount.toString()) },
          });
        }
      }

      return member;
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error adding member:", error);
    res.status(500).json({ 
      message: error.message || "Error adding member", 
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta
      } 
    });
  }
});

router.post("/bulk", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { members } = req.body;
  try {
    const result = await prisma.member.createMany({
      data: members.map((m: any) => ({
        name: m.name,
        email: m.email || "",
        mobile: m.mobile,
        flatNo: m.flatNo,
        address: m.address || "",
        outstandingDues: m.outstandingDues ? parseFloat(m.outstandingDues.toString()) : 0,
        tenantId: req.user.tenantId,
      }))
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.user.tenantId,
        actionType: "MEMBER_BULK_IMPORT",
        performedBy: req.user.name,
        details: `Imported ${result.count} members via bulk upload`,
      }
    });

    res.json({ message: `${result.count} members imported successfully`, count: result.count });
  } catch (error) {
    res.status(500).json({ message: "Error importing members", error });
  }
});

router.patch("/:id/vacant", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: req.params.id, tenantId: req.user.tenantId } });
      if (!member) throw new Error("Member not found");
      
      if (member.userId) {
        await tx.user.delete({ where: { id: member.userId } });
      }
      return await tx.member.update({
        where: { id: req.params.id },
        data: { status: "VACANT", userId: null }
      });
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error marking member as vacant", error: error.message });
  }
});

router.patch("/:id", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { name, email, mobile, flatNo, address, outstandingDues, status, password, enableLogin, defaultTenure, paidUntil, photoUrl, idProofUrl, createdAt } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const currentMember = await tx.member.findUnique({
        where: { id: req.params.id, tenantId: req.user.tenantId },
        include: { user: true }
      });

      if (!currentMember) throw new Error("Member not found");

      let userId = currentMember.userId;

      if (userId) {
        // Update existing user
        const updateData: any = { name, email: email || undefined, mobile: mobile || undefined };
        if (password && password.trim() !== "") {
          updateData.password = await bcrypt.hash(password, 10);
        }
        await tx.user.update({
          where: { id: userId },
          data: updateData
        });
      } else {
        // Create new user
        const fallbackPassword = mobile ? mobile.trim() : "123456";
        const passwordToHash = (password && password.trim() !== "") ? password : fallbackPassword;
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);
        const user = await tx.user.create({
          data: {
            name,
            email: email || undefined,
            mobile: mobile || undefined,
            password: hashedPassword,
            role: "MEMBER",
            tenantId: req.user.tenantId,
          }
        });
        userId = user.id;
      }

      const member = await tx.member.update({
        where: { id: req.params.id },
        data: {
          name,
          email,
          mobile,
          flatNo,
          address,
          outstandingDues: outstandingDues !== undefined ? parseFloat(outstandingDues.toString()) : undefined,
          status,
          userId,
          defaultTenure: defaultTenure || undefined,
          paidUntil: paidUntil ? new Date(paidUntil) : undefined,
          photoUrl: photoUrl !== undefined ? photoUrl : undefined,
          idProofUrl: idProofUrl !== undefined ? idProofUrl : undefined,
          createdAt: createdAt ? new Date(createdAt) : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.user.tenantId,
          actionType: "MEMBER_UPDATED",
          performedBy: req.user.name,
          referenceId: member.id,
          details: `Updated details for member ${member.name} (${member.flatNo}). Login ${enableLogin ? 'Enabled' : 'No Change'}.`,
        }
      });

      return member;
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error updating member:", error);
    res.status(500).json({ message: error.message || "Error updating member", error });
  }
});

export default router;
