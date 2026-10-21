import React, { createContext, useContext, useState, useEffect } from "react";

interface AppShellContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  isComposeOpen: boolean;
  openCompose: (initialData?: { to?: string; subject?: string; body?: string }) => void;
  closeCompose: () => void;
  composeData: { to?: string; subject?: string; body?: string } | null;
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  mailboxConnected: boolean;
  setMailboxConnected: (connected: boolean) => void;
  lastSyncedTime: string;
  triggerSync: () => void;
  isSyncing: boolean;
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export const AppShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("mymail_sidebar_collapsed") === "true";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState<{ to?: string; subject?: string; body?: string } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mailboxConnected, setMailboxConnected] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState("Just now");
  const [isSyncing, setIsSyncing] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("mymail_sidebar_collapsed", String(next));
      return next;
    });
  };

  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const openCompose = (data?: { to?: string; subject?: string; body?: string }) => {
    setComposeData(data || null);
    setIsComposeOpen(true);
  };

  const closeCompose = () => {
    setIsComposeOpen(false);
    setComposeData(null);
  };

  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  const triggerSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedTime("Just now");
    }, 1200);
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K and Compose ('c')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when typing in inputs/textareas
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (!isInput && e.key === "c" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openCompose();
      } else if (e.key === "Escape") {
        if (isCommandPaletteOpen) closeCommandPalette();
        if (isComposeOpen) closeCompose();
        if (isMobileMenuOpen) closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, isComposeOpen, isMobileMenuOpen]);

  return (
    <AppShellContext.Provider
      value={{
        isSidebarCollapsed,
        toggleSidebar,
        isMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
        isComposeOpen,
        openCompose,
        closeCompose,
        composeData,
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        mailboxConnected,
        setMailboxConnected,
        lastSyncedTime,
        triggerSync,
        isSyncing,
      }}
    >
      {children}
    </AppShellContext.Provider>
  );
};

export const useAppShell = (): AppShellContextType => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an AppShellProvider");
  }
  return context;
};
