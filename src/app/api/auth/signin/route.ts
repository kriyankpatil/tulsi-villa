import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();
  if (!name || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ id: user.id, name: user.name, role: user.role, rhNo: user.rhNo });
}


