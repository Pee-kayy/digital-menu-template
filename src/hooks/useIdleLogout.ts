import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

export function useIdleLogout(timeoutMs: number, onIdle: () => void) {
  const timerRef = useRef<number | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const location = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    function reset() {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => onIdleRef.current(), timeoutMs);
    }
    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeoutMs, location]);
}
