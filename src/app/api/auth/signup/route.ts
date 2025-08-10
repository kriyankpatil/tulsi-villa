import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, password, rhNo } = await req.json();
  if (!name || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ error: "Name already in use" }, { status: 409 });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, passwordHash, rhNo: rhNo ?? null, role: "MEMBER" } });
  await createSession(user.id);
  return NextResponse.json({ id: user.id, name: user.name, role: user.role, rhNo: user.rhNo });
}


