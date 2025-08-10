import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";

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
  await createSession(admin.id);
  return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
}


