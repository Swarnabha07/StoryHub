"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({ children, session }) {
  return (
    <div>
      <SessionProvider session={session}>{children}</SessionProvider>
    </div>
  );
}
