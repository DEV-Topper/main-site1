"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
