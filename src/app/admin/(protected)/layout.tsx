import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/signin");
  }
  if (user.role !== "ADMIN") {
    redirect("/admin/signin");
  }
  return <>{children}</>;
}


