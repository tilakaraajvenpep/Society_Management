import express from "express";
import prisma from "../utils/prisma";
import { authenticate, authorize } from "../middleware/auth";
import { calculateDues } from "./member";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { memberId, amount, mode, notes, subscriptionId, paidMonths, periodLabel, coverageStartDate, coverageEndDate, paymentDate } = req.body;
  try {
    // Fetch member name and current paidUntil
    const currentMember = await prisma.member.findUnique({ where: { id: memberId }, select: { name: true, flatNo: true, paidUntil: true, outstandingDues: true } });
    const memberLabel = currentMember ? `${currentMember.name} (Flat ${currentMember.flatNo})` : memberId;

    const payment = await prisma.$transaction(async (tx) => {
      const count = await tx.payment.count({ where: { tenantId: req.user.tenantId } });
      const receiptNumber = `REC-${(count + 1).toString().padStart(4, '0')}`;

      const normalizedMode = (mode as string).toUpperCase();

      const monthsToAdd = parseInt(paidMonths) || 1;
      const label = periodLabel || (monthsToAdd === 1 ? 'Monthly' : monthsToAdd === 3 ? 'Quarterly' : monthsToAdd === 6 ? 'Half-Yearly' : monthsToAdd === 12 ? 'Annual' : `${monthsToAdd} Months`);

      const p = await tx.payment.create({
        data: {
          memberId,
          amount: parseFloat(amount.toString()),
          mode: normalizedMode as any,
          notes: notes || null,
          subscriptionId: subscriptionId || undefined,
          tenantId: req.user.tenantId,
          collectedById: req.user.id,
          receiptNumber,
          handoverStatus: normalizedMode === "CASH" ? "WITH_COLLECTOR" : "TRANSFERRED_TO_BANK",
          paidMonths: monthsToAdd,
          periodLabel: label,
          coverageStartDate: coverageStartDate ? new Date(coverageStartDate) : null,
          coverageEndDate: coverageEndDate ? new Date(coverageEndDate) : null,
          paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        },
      });

      if (normalizedMode === "CASH") {
        await tx.cashBalance.upsert({
          where: { userId: req.user.id },
          update: { balance: { increment: parseFloat(amount.toString()) } },
          create: { userId: req.user.id, balance: parseFloat(amount.toString()) },
        });
      }

      // Calculate new paidUntil date
      let newPaidUntil = currentMember?.paidUntil ? new Date(currentMember.paidUntil) : new Date();
      if (!currentMember?.paidUntil) {
        newPaidUntil.setDate(1);
        newPaidUntil.setHours(0, 0, 0, 0);
      }
      
      if (coverageEndDate) {
        const proposed = new Date(coverageEndDate);
        if (proposed > newPaidUntil) {
          newPaidUntil = proposed;
        }
      } else {
        newPaidUntil.setMonth(newPaidUntil.getMonth() + monthsToAdd);
      }

      // Decrease member's outstandingDues (up to 0) and update paidUntil
      const memberDues = currentMember?.outstandingDues || 0;
      const decrementAmount = Math.min(memberDues, parseFloat(amount.toString()));

      await tx.member.update({
        where: { id: memberId },
        data: { 
          outstandingDues: { decrement: decrementAmount },
          paidUntil: newPaidUntil
        }
      });

      return p;
    });

    // Create audit log with readable member name
    await prisma.auditLog.create({
      data: {
        tenantId: req.user.tenantId,
        actionType: "PAYMENT_CREATED",
        performedBy: req.user.name,
        referenceId: payment.id,
        details: `${payment.receiptNumber}: ₹${amount} collected from ${memberLabel} via ${payment.mode} (${payment.periodLabel})`,
      },
    });

    res.json(payment);
  } catch (error: any) {
    console.error("Error recording payment:", error);
    res.status(500).json({ message: "Error recording payment", error: error.message });
  }
});

router.get("/history", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const payments = await prisma.payment.findMany({
    where: { tenantId: req.user.tenantId },
    include: { member: true, collectedBy: true },
    orderBy: { paymentDate: "desc" },
  });
  res.json(payments);
});

router.get("/upcoming", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  try {
    const now = new Date();
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const upcomingMembers = await prisma.member.findMany({
      where: {
        tenantId: req.user.tenantId,
        status: "ACTIVE",
        OR: [
          { outstandingDues: { gt: 0 } },
          { paidUntil: null },
          { paidUntil: { lte: endOfThisMonth } }
        ]
      },
      orderBy: { flatNo: 'asc' }
    });

    const enrichedMembers = await Promise.all(
      upcomingMembers.map(async (m) => {
        let additionalDues = 0;
        if (m.paidUntil) {
          const d = new Date(m.paidUntil);
          const paidUntilStr = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`;
          additionalDues = await calculateDues(prisma, req.user.tenantId, paidUntilStr, m.defaultTenure);
        }
        return {
          ...m,
          totalDues: (m.outstandingDues || 0) + additionalDues
        };
      })
    );
    
    res.json(enrichedMembers);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching upcoming dues", error: error.message });
  }
});

router.patch("/:id", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { status, amount, notes } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.payment.findUnique({
        where: { id: req.params.id, tenantId: req.user.tenantId }
      });

      if (!current) throw new Error("Payment not found");
      if (current.status === "CANCELLED") throw new Error("Already cancelled");

      let finalStatus = status || current.status;
      let finalAmount = amount !== undefined ? amount : current.amount;
      
      // If cancelling
      if (status === "CANCELLED") {
        if (current.mode === "CASH") {
          await tx.cashBalance.update({
            where: { userId: current.collectedById },
            data: { balance: { decrement: current.amount } }
          });
        }
        await tx.member.update({
          where: { id: current.memberId },
          data: { outstandingDues: { increment: current.amount } }
        });
      } else if (amount !== undefined && amount !== current.amount) {
        // If amount changed
        const diff = amount - current.amount;
        if (current.mode === "CASH") {
          await tx.cashBalance.update({
            where: { userId: current.collectedById },
            data: { balance: { increment: diff } }
          });
        }
        await tx.member.update({
          where: { id: current.memberId },
          data: { outstandingDues: { decrement: diff } }
        });
      }

      const updated = await tx.payment.update({
        where: { id: req.params.id },
        data: {
          status: finalStatus as any,
          amount: finalAmount,
          notes: notes || current.notes,
          lastEditedBy: req.user.name,
          lastEditedAt: new Date(),
        }
      });

      return updated;
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.user.tenantId,
        actionType: status === "CANCELLED" ? "PAYMENT_CANCELLED" : "PAYMENT_UPDATED",
        performedBy: req.user.name,
        referenceId: result.id,
        details: `Payment ${result.receiptNumber} ${status === "CANCELLED" ? 'cancelled' : 'updated'}. ${amount ? `New amount: ${amount}` : ''}`,
      }
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Error updating payment", error });
  }
});

export default router;
