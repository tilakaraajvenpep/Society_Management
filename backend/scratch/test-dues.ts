import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { name: "Sunrise Apartments" }
  });
  if (!tenant) {
    console.error("Tenant not found");
    return;
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  
  console.log(`Current Date used: ${todayStr}`);

  // Test 1: Active date is today, default tenure is ANNUAL
  const dues1 = await calculateDues(prisma, tenant.id, todayStr, "ANNUAL");
  console.log(`Test 1 (Today, ANNUAL): ${dues1} (Expected: 14000)`);

  // Test 2: Active date is today, default tenure is MONTHLY
  const dues2 = await calculateDues(prisma, tenant.id, todayStr, "MONTHLY");
  console.log(`Test 2 (Today, MONTHLY): ${dues2} (Expected: 14000/12 = 1166.67)`);

  // Test 3: Active date is in the past (e.g. 2025-06-16), default tenure is ANNUAL
  const pastStr = `${today.getFullYear() - 1}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const dues3 = await calculateDues(prisma, tenant.id, pastStr, "ANNUAL");
  console.log(`Test 3 (${pastStr}, ANNUAL): ${dues3} (Expected: 50000 + 14000 = 64000)`);
}

main().finally(() => prisma.$disconnect());
