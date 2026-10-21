import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Flame,
  Sparkles,
  FileEdit,
  Clock,
  Settings,
  ChevronLeft,
  LogOut,
  RefreshCw,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAppShell } from "../../context/AppShellContext";
import { BrandLogo } from "../ui/BrandLogo";

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeType?: "lime" | "forest" | "amber" | "neutral";
}

export const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    openCompose,
    isMobileMenuOpen,
    closeMobileMenu,
    mailboxConnected,
    lastSyncedTime,
    triggerSync,
    isSyncing,
  } = useAppShell();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      name: "Overview",
      to: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Inbox",
      to: "/inbox",
      icon: Inbox,
      badge: 12,
      badgeType: "lime",
    },
    {
      name: "Needs Reply",
      to: "/needs-reply",
      icon: Flame,
      badge: 4,
      badgeType: "amber",
    },
    {
      name: "AI Summaries",
      to: "/summaries",
      icon: Sparkles,
      badge: "AI",
      badgeType: "forest",
    },
    {
      name: "Drafts",
      to: "/drafts",
      icon: FileEdit,
      badge: 2,
      badgeType: "neutral",
    },
    {
      name: "Follow-up Reminders",
      to: "/reminders",
      icon: Clock,
      badge: 3,
      badgeType: "neutral",
    },
    {
      name: "Settings",
      to: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getBadgeStyle = (type?: string, isActive?: boolean) => {
    if (isActive) {
      return "bg-lime-action text-forest font-extrabold";
    }
    switch (type) {
      case "amber":
        return "bg-amber-100 text-amber-900 border border-amber-200";
      case "forest":
        return "bg-forest/10 text-forest border border-forest/15";
      case "lime":
        return "bg-lime-light text-forest border border-lime-action/40";
      default:
        return "bg-surface-offwhite text-ink-secondary border border-surface-border";
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-surface-border select-none">
      {/* Top Branding Section */}
      <div
        className={`h-20 flex items-center border-b border-surface-border px-5 transition-all duration-300 ${
          isSidebarCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {isSidebarCollapsed ? (
          <div
            onClick={toggleSidebar}
            title="Expand Sidebar"
            className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center cursor-pointer shadow-md shadow-forest/10 hover:scale-105 transition-transform"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5 text-lime-action"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="3" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
        ) : (
          <>
            <BrandLogo size="md" to="/dashboard" />
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-7 h-7 rounded-full bg-surface-offwhite border border-surface-border items-center justify-center text-ink-secondary hover:text-forest hover:bg-surface-hover transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Compose Quick Action */}
      <div className="p-4 border-b border-surface-border/60">
        {isSidebarCollapsed ? (
          <button
            onClick={() => openCompose()}
            title="Compose with AI (Press C)"
            className="w-11 h-11 mx-auto rounded-2xl bg-forest text-lime-action hover:bg-forest-light flex items-center justify-center shadow-md shadow-forest/20 transition-all hover:scale-105 active:scale-95 group relative"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="sr-only">Compose with AI</span>
          </button>
        ) : (
          <button
            onClick={() => openCompose()}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-full bg-forest text-white hover:bg-forest-light shadow-md shadow-forest/15 transition-all duration-200 hover:shadow-lg active:scale-[0.98] group cursor-pointer border border-forest-light/30"
          >
            <div className="w-6 h-6 rounded-full bg-lime-action/20 flex items-center justify-center text-lime-action group-hover:scale-110 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-lime-action" />
            </div>
            <span className="text-sm font-bold tracking-tight">Compose with AI</span>
            <span className="ml-auto text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
              C
            </span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? "bg-forest text-lime-action shadow-sm font-bold"
                    : "text-ink-secondary hover:text-forest hover:bg-surface-offwhite"
                } ${isSidebarCollapsed ? "justify-center px-0" : ""}`
              }
              title={isSidebarCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-lime-action" : "text-ink-secondary group-hover:text-forest"
                    }`}
                  />

                  {!isSidebarCollapsed && (
                    <>
                      <span className="truncate flex-1">{item.name}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${getBadgeStyle(
                            item.badgeType,
                            isActive
                          )}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {isSidebarCollapsed && item.badge !== undefined && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-lime-action ring-2 ring-white" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Connected Provider / Mailbox Status Widget */}
      <div className="p-3 border-t border-surface-border">
        {isSidebarCollapsed ? (
          <div
            title={`Mailbox: ${mailboxConnected ? "Connected" : "Disconnected"} • Last synced ${lastSyncedTime}`}
            className="w-10 h-10 mx-auto rounded-2xl bg-surface-offwhite border border-surface-border flex items-center justify-center cursor-pointer hover:bg-surface-hover transition-colors"
            onClick={triggerSync}
          >
            <RefreshCw
              className={`w-4 h-4 text-forest ${isSyncing ? "animate-spin text-lime-hover" : ""}`}
            />
          </div>
        ) : (
          <div className="bg-surface-offwhite rounded-2xl p-3.5 border border-surface-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-lime-soft/70 border border-lime-action flex items-center justify-center text-forest">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink-primary leading-tight">Gmail Sync</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-ink-muted">{lastSyncedTime}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={triggerSync}
                disabled={isSyncing}
                title="Sync Mailbox Now"
                className="w-7 h-7 rounded-lg hover:bg-surface-hover flex items-center justify-center text-ink-secondary hover:text-forest transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-forest" : ""}`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-surface-border/60 text-[11px] text-ink-secondary font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>Safe Send Lock Active</span>
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-surface-border bg-white">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl transition-colors hover:bg-surface-offwhite ${
            isSidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-forest text-lime-action font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink-primary truncate leading-tight">
                  {user?.full_name}
                </p>
                <p className="text-[11px] text-ink-muted truncate mt-0.5">{user?.email}</p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              title="Log out"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-forest-dark/40 backdrop-blur-sm transition-opacity"
            onClick={closeMobileMenu}
          />

          {/* Sliding Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
