import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("@/components/DashboardClient"), {
  ssr: false,
  loading: () => <main className="min-h-screen grid place-items-center">Loading dashboard...</main>,
});

export default function DashboardPage() {
  return <DashboardClient />;
}
