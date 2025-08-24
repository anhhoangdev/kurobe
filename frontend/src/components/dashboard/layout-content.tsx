"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/sidebar/sidebar-left";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface DashboardLayoutContentProps {
  children: React.ReactNode;
}

export function DashboardLayoutContent({
  children,
}: DashboardLayoutContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate auth check - in real app this would check actual auth state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <div className="bg-background min-h-screen">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
