import prisma from "../src/utils/prisma";

async function run() {
  try {
    const member = await prisma.member.findFirst({
      where: { name: { contains: "Tilak", mode: "insensitive" } },
      include: {
        payments: true
      }
    });

    if (!member) {
      console.log("Member Tilak not found!");
      return;
    }

    console.log("MEMBER DETAILED DATA:");
    console.log("ID:", member.id);
    console.log("Name:", member.name);
    console.log("CreatedAt (Registration Date):", member.createdAt);
    console.log("PaidUntil:", member.paidUntil);
    console.log("Outstanding Dues stored in DB:", member.outstandingDues);
    console.log("Default Tenure:", member.defaultTenure);
    console.log("\nPAYMENTS:");
    member.payments.forEach((p, idx) => {
      console.log(`Payment #${idx+1}:`, {
        id: p.id,
        amount: p.amount,
        mode: p.mode,
        paymentDate: p.paymentDate,
        financialYear: p.financialYear,
        createdAt: p.createdAt,
        coverageStartDate: p.coverageStartDate,
        coverageEndDate: p.coverageEndDate,
        periodLabel: p.periodLabel
      });
    });

  } catch (error) {
    console.error("Error inspecting Tilak:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
