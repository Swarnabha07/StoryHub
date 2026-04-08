"use client";

import SessionWrapper from "./SessionWrapper";
import { StoreProvider } from "@/Store/store";
import NotificationProvider from "./NotificationProvider";



export default function AppProviders({ children }) {
  return (
    <SessionWrapper>
      <StoreProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </StoreProvider>
    </SessionWrapper>
  );
}