import express from "express";
import prisma from "../utils/prisma";
import { authenticate, authorize } from "../middleware/auth";
import { calculateDues } from "./member";

const router = express.Router();
router.use(authenticate);

router.get("/summary", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const { tenantId } = req.user;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // --- Totals ---
    const [totalIncomeAgg, totalExpensesAgg, tenantInfo, members] = await Promise.all([
      prisma.payment.aggregate({ where: { tenantId }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { tenantId }, _sum: { amount: true } }),
      prisma.tenant.findUnique({ 
        where: { id: tenantId }, 
        select: { 
          maintenanceAmount: true, 
          quarterlyAmount: true, 
          halfYearlyAmount: true, 
          annualAmount: true,
          enableForums: true
        } as any 
      }),
      prisma.member.findMany({ where: { tenantId } }),
    ]);

    let totalOutstanding = 0;
    let membersWithDuesCount = 0;
    
    for (const m of members) {
      let additionalDues = 0;
      const d = m.paidUntil ? new Date(m.paidUntil) : null;
      const paidUntilStr = d ? `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}` : null;
      additionalDues = await calculateDues(prisma, tenantId, paidUntilStr, m.defaultTenure, m.createdAt);
      const totalM = (m.outstandingDues || 0) + additionalDues;
      if (totalM > 0) {
        totalOutstanding += totalM;
        membersWithDuesCount += 1;
      }
    }

    // --- This month vs last month ---
    const [thisMonthIncome, lastMonthIncome, thisMonthExpenses, lastMonthExpenses] = await Promise.all([
      prisma.payment.aggregate({ where: { tenantId, paymentDate: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { tenantId, paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { tenantId, date: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { tenantId, date: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { amount: true } }),
    ]);

    // --- Cash in hand (sum of all CashBalance records for this tenant) ---
    const cashBalanceRows = await prisma.cashBalance.findMany({
      where: { user: { tenantId } },
      select: { balance: true },
    });
    const totalCashInHand = cashBalanceRows.reduce((s: number, b: any) => s + (b.balance || 0), 0);

    // --- Expense breakdown by category ---
    const expenseByCategory = await prisma.expense.groupBy({
      by: ["category"],
      where: { tenantId },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    // --- Monthly trends: last 6 months ---
    const monthlyData: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const label = mStart.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const [inc, exp] = await Promise.all([
        prisma.payment.aggregate({ where: { tenantId, paymentDate: { gte: mStart, lte: mEnd } }, _sum: { amount: true } }),
        prisma.expense.aggregate({ where: { tenantId, date: { gte: mStart, lte: mEnd } }, _sum: { amount: true } }),
      ]);
      monthlyData.push({ month: label, income: inc._sum.amount || 0, expenses: exp._sum.amount || 0, net: (inc._sum.amount || 0) - (exp._sum.amount || 0) });
    }

    // --- Recent payments (last 5) ---
    const recentPayments = await prisma.payment.findMany({
      where: { tenantId },
      include: { member: { select: { name: true, flatNo: true } } },
      orderBy: { paymentDate: "desc" },
      take: 5,
    });

    // --- Members summary ---
    const totalMembers = await prisma.member.count({ where: { tenantId } });

    const totalIncome = totalIncomeAgg._sum.amount || 0;
    const totalExpenses = totalExpensesAgg._sum.amount || 0;

    res.json({
      // Totals
      totalIncome,
      totalExpenses,
      totalOutstanding,
      netBalance: totalIncome - totalExpenses,
      totalCashInHand,
      // This month
      thisMonthIncome: thisMonthIncome._sum.amount || 0,
      thisMonthExpenses: thisMonthExpenses._sum.amount || 0,
      thisMonthNet: (thisMonthIncome._sum.amount || 0) - (thisMonthExpenses._sum.amount || 0),
      // Last month
      lastMonthIncome: lastMonthIncome._sum.amount || 0,
      lastMonthExpenses: lastMonthExpenses._sum.amount || 0,
      // Members
      totalMembers,
      membersWithDues: membersWithDuesCount,
      // Settings
      maintenanceAmount: (tenantInfo as any)?.maintenanceAmount || 0,
      quarterlyAmount: (tenantInfo as any)?.quarterlyAmount || null,
      halfYearlyAmount: (tenantInfo as any)?.halfYearlyAmount || null,
      annualAmount: (tenantInfo as any)?.annualAmount || null,
      enableForums: (tenantInfo as any)?.enableForums || false,
      // Charts
      monthlyTrends: monthlyData,
      expenseByCategory: expenseByCategory.map((e: any) => ({ category: e.category, amount: e._sum.amount || 0 })),
      recentPayments: recentPayments.map((p: any) => ({
        id: p.id, amount: p.amount, mode: p.mode, date: p.paymentDate,
        memberName: p.member?.name || "Unknown", flatNo: p.member?.flatNo || "",
      })),
    });
  } catch (error: any) {
    console.error("Summary error:", error.message);
    res.status(500).json({ message: "Error fetching summary", error: error.message });
  }
});

router.get("/financials", authorize(["TENANT_ADMIN"]), async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { startDate, endDate } = req.query;

  try {
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else if (startDate) {
      dateFilter = { gte: new Date(startDate as string) };
    } else if (endDate) {
      dateFilter = { lte: new Date(endDate as string) };
    }

    const paymentWhere: any = { tenantId, status: "PAID" };
    if (Object.keys(dateFilter).length > 0) paymentWhere.paymentDate = dateFilter;

    const expenseWhere: any = { tenantId };
    if (Object.keys(dateFilter).length > 0) expenseWhere.date = dateFilter;
    // 1. Profit & Loss Data
    const incomeCategories = await (prisma.payment as any).groupBy({
      by: ['periodLabel'],
      where: paymentWhere,
      _sum: { amount: true }
    });
    
    const expenseCategories = await prisma.expense.groupBy({
      by: ['category'],
      where: expenseWhere,
      _sum: { amount: true }
    });

    const totalIncome = incomeCategories.filter((i: any) => i.periodLabel !== "Initial Onboarding Fee").reduce((acc: number, curr: any) => acc + (curr._sum?.amount || 0), 0);
    const totalExpenses = expenseCategories.reduce((acc: number, curr: any) => acc + (curr._sum?.amount || 0), 0);
    const corpusFundsAgg = incomeCategories.find((i: any) => i.periodLabel === "Initial Onboarding Fee");
    const corpusFunds = corpusFundsAgg?._sum?.amount || 0;

    // 2. Balance Sheet Data
    // Assets
    const cashInHandAgg = await prisma.cashBalance.aggregate({
      where: { user: { tenantId } },
      _sum: { balance: true }
    });
    const cashInHand = cashInHandAgg._sum.balance || 0;
    
    // Total Dues Receivable (Asset)
    const duesAgg = await prisma.member.aggregate({
      where: { tenantId },
      _sum: { outstandingDues: true }
    });
    const duesReceivable = duesAgg._sum.outstandingDues || 0;

    // Bank Balance (Derived: Total non-cash income minus non-cash expenses)
    // Simplified logic: all "BANK/UPI" payments - all "BANK" expenses. 
    // For now, let's treat (totalIncome - totalExpenses - cashInHand) as Bank Balance roughly.
    const bankBalance = (totalIncome - totalExpenses) - cashInHand;

    res.json({
      profitAndLoss: {
        income: incomeCategories.filter((i: any) => i.periodLabel !== "Initial Onboarding Fee").map((i: any) => ({ category: i.periodLabel || 'General', amount: i._sum?.amount || 0 })),
        expenses: expenseCategories.map((e: any) => ({ category: e.category, amount: e._sum?.amount || 0 })),
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses
      },
      balanceSheet: {
        assets: {
          cashInHand,
          bankBalance: bankBalance > 0 ? bankBalance : 0,
          duesReceivable
        },
        liabilities: {
          corpusFunds
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching financials", error: error.message });
  }
});

export default router;
