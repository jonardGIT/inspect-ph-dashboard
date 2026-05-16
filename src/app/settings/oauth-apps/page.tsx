import type { Metadata } from "next";

import { OAuthClientManager } from "@/components/oauth-client-manager";

export const metadata: Metadata = {
  title: "OAuth Apps — InspectPH",
};

export default function OAuthAppsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>OAuth Apps</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Registered third-party applications that can read data on behalf of
        business owners.
      </p>
      <OAuthClientManager />
    </div>
  );
}
