import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/upload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.receipt.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ ok: true });

  // Best-effort remove stored file
  await deleteStoredFile(existing.screenshotPath || null);
  await prisma.receipt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


