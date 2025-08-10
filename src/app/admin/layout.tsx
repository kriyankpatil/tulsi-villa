import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Do not guard here to avoid interfering with /admin/signin routing.
  // Protection is handled by middleware and server actions on protected pages.
  return <>{children}</>;
}


