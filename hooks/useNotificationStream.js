"use client";

import { useEffect, useRef } from "react";

export default function useNotificationStream(onNotification) {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    function connect() {
      const eventSource = new EventSource(
        "/api/notifications/stream"
      );

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        if (!event.data) return;

        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === "connected") return;

          onNotification?.(parsed);
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      eventSource.onerror = () => {
        console.warn("SSE connection lost. Reconnecting...");

        eventSource.close();

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    }

    connect();

    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [onNotification]);
}