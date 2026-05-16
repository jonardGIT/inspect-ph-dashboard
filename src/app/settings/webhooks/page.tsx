import type { Metadata } from "next";
import { WebhookEndpointManager } from "@/components/webhook-endpoint-manager";

export const metadata: Metadata = {
  title: "Webhook Endpoints — InspectPH",
};

export default function WebhookEndpointsPage() {
  return <WebhookEndpointManager />;
}
