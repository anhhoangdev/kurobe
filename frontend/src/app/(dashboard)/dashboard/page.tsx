import { Suspense } from "react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to dashboards list instead of showing individual dashboard
  // This resolves the overlap with the main question interface
  redirect("/dashboards");
}
