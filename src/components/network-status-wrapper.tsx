"use client";

import dynamic from "next/dynamic";

const NetworkStatus = dynamic(
  () =>
    import("./network-status").then((m) => ({ default: m.NetworkStatus })),
  { ssr: false }
);

export function NetworkStatusWrapper() {
  return <NetworkStatus />;
}
