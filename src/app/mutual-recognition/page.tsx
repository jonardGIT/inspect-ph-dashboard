import type { Metadata } from "next";

import { MutualRecognitionBrowser } from "@/components/mutual-recognition-browser";

export const metadata: Metadata = {
  title: "Mutual Recognition — InspectPH",
};

export default function MutualRecognitionPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Mutual Recognition</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Cross-LGU recognition of fire safety inspection certificates with
        verified compliance data and owner consent.
      </p>
      <MutualRecognitionBrowser />
    </div>
  );
}
