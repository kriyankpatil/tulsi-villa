import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  let where: Prisma.ReceiptWhereInput = {};
  if (user?.role === "MEMBER") {
    where = {
      OR: [
        { memberId: user.id },
        ...(user.rhNo ? [{ AND: [{ memberId: null }, { rhNo: user.rhNo }] }] : []),
      ],
    };
  }
  const [receipts] = await prisma.$transaction([
    prisma.receipt.findMany({ where, orderBy: { createdAt: "desc" } }),
  ]);
  const shaped = receipts.map((r) => ({ ...r, amount: r.amountPaise / 100 }));
  return NextResponse.json(shaped);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") || "");
  const rhNo = String(form.get("rhNo") || "");
  const amount = Number(String(form.get("amount") || "0"));
  const description = form.get("description")?.toString();
  const file = form.get("upload");
  const dateStr = form.get("date")?.toString();
  const date = dateStr ? new Date(dateStr) : new Date();

  if (!name || !rhNo || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!(file && file instanceof File)) {
    return NextResponse.json({ error: "Upload is required" }, { status: 400 });
  }
  const user = await getCurrentUser();
  const memberId = user?.role === "MEMBER" ? user.id : undefined;
  const saved = await saveUploadedFile(file, { subdirectory: "receipts" });
  const screenshotPath: string | null = saved?.relativePath ?? null;

  const created = await prisma.receipt.create({
    data: {
      name,
      rhNo,
      amountPaise: Math.round(amount * 100),
      description,
      screenshotPath: screenshotPath ?? undefined,
      date,
      memberId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}


