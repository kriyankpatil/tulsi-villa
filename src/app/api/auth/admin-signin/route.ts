import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Enforce fixed credentials
  if (String(username) !== "Admin" || String(password) !== "Admin123") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    const passwordHash = await hashPassword("Admin123");
    admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@local",
        passwordHash,
        role: "ADMIN",
      },
    });
  }
  
  // Security check: Ensure the user has ADMIN role
  if (admin.role !== "ADMIN") {
    return NextResponse.json({ 
      error: "Access denied. Admin privileges required." 
    }, { status: 403 });
  }
  
  const { token, expiresAt } = await createSession(admin.id);
  const res = NextResponse.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", expires: expiresAt, path: "/", secure: true });
  return res;
}


