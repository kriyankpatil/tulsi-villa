import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";

export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { createdAt: "desc" } });
  const shaped = expenses.map((e) => ({ ...e, amount: e.amountPaise / 100 }));
  return NextResponse.json(shaped);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") || "");
  const chequeNo = form.get("chequeNo")?.toString();
  const amount = Number(String(form.get("amount") || "0"));
  const description = form.get("description")?.toString();
  const file = form.get("upload");
  const dateStr = form.get("date")?.toString();
  const date = dateStr ? new Date(dateStr) : new Date();

  if (!name || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!(file && file instanceof File)) {
    return NextResponse.json({ error: "Upload is required" }, { status: 400 });
  }
  const saved = await saveUploadedFile(file, { subdirectory: "expenses" });
  const attachmentPath: string | null = saved?.relativePath ?? null;

  const created = await prisma.expense.create({
    data: {
      name,
      chequeNo: chequeNo ?? undefined,
      amountPaise: Math.round(amount * 100),
      description,
      attachmentPath: attachmentPath ?? undefined,
      date,
    },
  });

  return NextResponse.json(created, { status: 201 });
}


