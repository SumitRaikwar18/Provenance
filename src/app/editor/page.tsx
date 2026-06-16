import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("@/components/DashboardClient"), {
  ssr: false,
  loading: () => <main className="min-h-screen grid place-items-center">Loading editor...</main>,
});

export default function EditorPage() {
  return <DashboardClient />;
}
