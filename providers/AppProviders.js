"use client";

import SessionWrapper from "./SessionWrapper";
import { StoreProvider } from "@/Store/store";
import NotificationProvider from "./NotificationProvider";

export default function AppProviders({ children, session }) {
  return (
    <SessionWrapper session={session}>
      <StoreProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </StoreProvider>
    </SessionWrapper>
  );
}
