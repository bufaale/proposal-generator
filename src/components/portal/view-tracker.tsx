"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ token }: { token: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch(`/api/public/proposals/${token}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "viewed" }),
    }).catch(() => {
      // Silently ignore tracking errors
    });
  }, [token]);

  return null;
}
