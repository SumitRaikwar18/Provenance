"use client";

import { Dashboard } from "@/components/Dashboard";
import { Providers } from "@/components/Providers";

export default function DashboardClient() {
  return (
    <Providers>
      <Dashboard />
    </Providers>
  );
}
