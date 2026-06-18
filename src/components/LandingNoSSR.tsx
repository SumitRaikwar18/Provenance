"use client";

import dynamic from "next/dynamic";

const LandingClient = dynamic(() => import("@/components/LandingClient"), {
  ssr: false,
  loading: () => <main className="min-h-screen grid place-items-center">Loading Provenance...</main>,
});

export default function LandingNoSSR() {
  return <LandingClient />;
}

