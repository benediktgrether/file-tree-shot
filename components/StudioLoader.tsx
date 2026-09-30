"use client";

import dynamic from "next/dynamic";

// Client-only: settings live in localStorage, and rendering on the server would
// flash the default theme before the stored one is applied.
const Studio = dynamic(() => import("./Studio"), {
  ssr: false,
  loading: () => <div className="h-dvh bg-[#0b0b0c]" />,
});

export function StudioLoader() {
  return <Studio />;
}
