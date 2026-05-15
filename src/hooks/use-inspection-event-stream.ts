"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getApiOrigin } from "@/lib/api/http";

type ConnectionState = "connecting" | "connected" | "disconnected";

/**
 * Opens a Server-Sent Events connection to the inspection event stream.
 * Automatically invalidates the inspection browser query when a relevant
 * event is received, triggering a refetch of the list.
 *
 * Cleans up the EventSource when the component unmounts or the token changes.
 */
export function useInspectionEventStream(accessToken: string | undefined) {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    // EventSource does not support Authorization headers, so we pass the token
    // as a query parameter. The API validates it identically to Bearer tokens.
    const url = `${getApiOrigin()}/api/v1/inspections/events?token=${encodeURIComponent(accessToken)}`;
    const es = new EventSource(url);
    esRef.current = es;

    setConnectionState("connecting");

    es.addEventListener("open", () => {
      setConnectionState("connected");
    });

    const handleInspectionEvent = () => {
      void queryClient.invalidateQueries({
        queryKey: ["inspections-browser"],
      });
    };

    es.addEventListener("inspection.assigned", handleInspectionEvent);
    es.addEventListener("inspection.status_updated", handleInspectionEvent);
    es.addEventListener("inspection.finding_logged", handleInspectionEvent);

    es.addEventListener("error", () => {
      setConnectionState("disconnected");
    });

    return () => {
      es.close();
      esRef.current = null;
      setConnectionState("disconnected");
    };
  }, [accessToken, queryClient]);

  return { connectionState };
}
