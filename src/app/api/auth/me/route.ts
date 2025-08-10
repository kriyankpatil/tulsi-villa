import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(user ? { id: user.id, name: user.name, email: user.email, role: user.role, rhNo: user.rhNo } : null);
}


