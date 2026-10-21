import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  ShieldCheck,
  Sparkles,
  Command,
  LogOut,
  Settings as SettingsIcon,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppShell } from "../../context/AppShellContext";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "reply" | "summary" | "reminder";
  link: string;
}

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { openMobileMenu, openCommandPalette, openCompose } = useAppShell();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Immediate Reply Needed",
      description: "Sarah Chen asked for Q4 cloud budget approval before 4:00 PM.",
      time: "10m ago",
      unread: true,
      type: "reply",
      link: "/needs-reply",
    },
    {
      id: "2",
      title: "AI Thread Summary Ready",
      description: "Generated 3 conclusions and 2 action items for 'Marketing Launch Sync'.",
      time: "45m ago",
      unread: true,
      type: "summary",
      link: "/summaries",
    },
    {
      id: "3",
      title: "Follow-up Reminder",
      description: "Time to check in with Alex Rivera regarding contract revisions.",
      time: "2h ago",
      unread: false,
      type: "reminder",
      link: "/reminders",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-surface-border px-4 sm:px-6 sticky top-0 z-20 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger & Global Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={openMobileMenu}
          className="lg:hidden w-10 h-10 rounded-2xl bg-surface-offwhite border border-surface-border flex items-center justify-center text-ink-primary hover:bg-surface-hover transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Omni-Search Bar (Triggers Command Palette) */}
        <div
          onClick={openCommandPalette}
          className="flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-surface-offwhite border border-surface-border text-ink-secondary hover:border-lime-action/80 hover:bg-white hover:shadow-soft-card transition-all cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Search emails and commands"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 text-ink-muted group-hover:text-forest transition-colors shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-ink-muted group-hover:text-ink-secondary truncate">
              Search emails, AI summaries, or type a command...
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-surface-border text-[11px] font-mono text-ink-muted shadow-2xs shrink-0">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Human-in-the-Loop Safe Guard Badge */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft/60 border border-lime-action/60 text-forest text-xs font-bold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
          <span>Safe Send Mode</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="w-10 h-10 rounded-2xl bg-surface-offwhite hover:bg-surface-hover border border-surface-border flex items-center justify-center text-ink-secondary hover:text-forest transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Flyout Card */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-soft-card border border-surface-border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-ink-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-lime-light border border-lime-action/40 text-forest text-[10px] font-extrabold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-forest hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link}
                    onClick={() => setIsNotificationsOpen(false)}
                    className={`block p-3 rounded-2xl transition-all ${
                      n.unread
                        ? "bg-lime-soft/20 border border-lime-action/30"
                        : "hover:bg-surface-offwhite"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-ink-primary leading-tight">{n.title}</h4>
                      <span className="text-[10px] text-ink-muted whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                      {n.description}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-surface-border text-center">
                <Link
                  to="/needs-reply"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-bold text-forest hover:text-forest-light inline-flex items-center gap-1"
                >
                  View action queue <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-offwhite hover:bg-surface-hover border border-surface-border transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-forest text-lime-action font-extrabold flex items-center justify-center text-xs shadow-xs">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <span className="text-xs font-bold text-ink-primary hidden sm:inline-block max-w-[100px] truncate">
              {user?.full_name?.split(" ")[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-soft-card border border-surface-border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-surface-border">
                <p className="text-xs font-bold text-ink-primary truncate">{user?.full_name}</p>
                <p className="text-[11px] text-ink-muted truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:text-forest hover:bg-surface-offwhite transition-colors"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Preferences & Tone</span>
                </Link>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openCompose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:text-forest hover:bg-surface-offwhite transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-forest" />
                  <span>New AI Draft (C)</span>
                </button>
              </div>

              <div className="pt-1 border-t border-surface-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
