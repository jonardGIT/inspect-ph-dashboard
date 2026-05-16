import type { Metadata } from "next";

import LguOnboardingWizard from "@/components/lgu-onboarding-wizard";

export const metadata: Metadata = {
  title: "Provision LGU | Inspect PH",
};

export default function OnboardingPage() {
  return <LguOnboardingWizard />;
}
