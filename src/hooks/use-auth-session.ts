import { useAuthSessionContext } from "@/components/auth-session-provider";

export function useAuthSession() {
  return useAuthSessionContext();
}
