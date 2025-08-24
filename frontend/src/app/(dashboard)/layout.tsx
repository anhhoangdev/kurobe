"use client";

import { DashboardLayoutContent } from "@/components/dashboard/layout-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
