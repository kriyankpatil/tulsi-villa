import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();
  if (!name || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  
  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  
  // Security check: Prevent admin users from using member signin
  if (user.role === "ADMIN") {
    return NextResponse.json({ 
      error: "Admin users must use the admin signin page" 
    }, { status: 403 });
  }
  
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  
  const { token, expiresAt } = await createSession(user.id);
  const res = NextResponse.json({ id: user.id, name: user.name, role: user.role, rhNo: user.rhNo });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", expires: expiresAt, path: "/", secure: true });
  return res;
}


