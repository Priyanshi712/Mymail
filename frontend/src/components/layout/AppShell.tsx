import React from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { ComposeModal } from "./ComposeModal";
import { SearchCommandPalette } from "./SearchCommandPalette";
import { AppShellProvider } from "../../context/AppShellContext";

const AppShellLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-offwhite flex text-ink-primary font-sans antialiased overflow-x-hidden">
      {/* App Sidebar */}
      <AppSidebar />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky App Header */}
        <AppHeader />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <ComposeModal />
      <SearchCommandPalette />
    </div>
  );
};

export const AppShell: React.FC = () => {
  return (
    <AppShellProvider>
      <AppShellLayout />
    </AppShellProvider>
  );
};

export default AppShell;
