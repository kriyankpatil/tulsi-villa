import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/signin");
  }
  
  // Security check: Prevent admin users from accessing member pages
  if (user.role !== "MEMBER") {
    redirect("/admin/signin");
  }
  
  return <>{children}</>;
}
