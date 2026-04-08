"use client";
import { createContext, useContext, useState } from "react";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // global states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const incrementUnread = () => setUnreadCount((prev) => prev + 1);

  const resetUnread = () => setUnreadCount(0);

  return (
    <StoreContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        unreadCount,
        setUnreadCount,
        incrementUnread,
        resetUnread,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store easily
export const useStore = () => useContext(StoreContext);
