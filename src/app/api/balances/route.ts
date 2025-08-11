import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function ensureRow() {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.adminBalances.findFirst();
    if (!existing) {
      await tx.adminBalances.create({ data: { id: 1 } });
    }
  });
}

export async function GET() {
  await ensureRow();
  const [balances, approvedReceipts, expenses] = await prisma.$transaction([
    prisma.adminBalances.findFirst(),
    prisma.receipt.aggregate({ where: { status: "APPROVED" }, _sum: { amountPaise: true } }),
    prisma.expense.aggregate({ _sum: { amountPaise: true } }),
  ]);

  const receivedPaise = Number(approvedReceipts._sum.amountPaise ?? 0) + Number(balances?.receivedAdjustmentPaise ?? 0);
  const expensePaise = Number(expenses._sum.amountPaise ?? 0) + Number(balances?.expenseAdjustmentPaise ?? 0);
  const totalPaise = receivedPaise - expensePaise;

  return NextResponse.json({
    received: receivedPaise / 100,
    expense: expensePaise / 100,
    total: totalPaise / 100,
    adjustments: {
      received: Number(balances?.receivedAdjustmentPaise ?? 0) / 100,
      expense: Number(balances?.expenseAdjustmentPaise ?? 0) / 100,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const receivedAdjustment = Number(body.receivedAdjustment ?? 0);
  const expenseAdjustment = Number(body.expenseAdjustment ?? 0);
  await ensureRow();
  const updated = await prisma.adminBalances.update({
    where: { id: 1 },
    data: { receivedAdjustmentPaise: Math.round(receivedAdjustment * 100), expenseAdjustmentPaise: Math.round(expenseAdjustment * 100) },
  });
  return NextResponse.json(updated);
}


