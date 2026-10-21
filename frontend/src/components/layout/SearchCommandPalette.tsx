import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Inbox,
  Flame,
  Sparkles,
  FileEdit,
  Clock,
  Settings,
  Mail,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAppShell } from "../../context/AppShellContext";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Action" | "Email";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const SearchCommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    openCompose,
    triggerSync,
  } = useAppShell();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const items: SearchResult[] = [
    {
      id: "nav-inbox",
      title: "Go to Inbox",
      subtitle: "View 12 unread conversations & email threads",
      category: "Navigation",
      icon: Inbox,
      action: () => navigate("/inbox"),
    },
    {
      id: "nav-needs-reply",
      title: "Needs Reply Queue",
      subtitle: "4 urgent emails requiring your response",
      category: "Navigation",
      icon: Flame,
      action: () => navigate("/needs-reply"),
    },
    {
      id: "nav-summaries",
      title: "AI Thread Summaries",
      subtitle: "Structured conclusions, topics, and open questions",
      category: "Navigation",
      icon: Sparkles,
      action: () => navigate("/summaries"),
    },
    {
      id: "nav-drafts",
      title: "Review Drafts",
      subtitle: "Inspect and approve pending AI responses",
      category: "Navigation",
      icon: FileEdit,
      action: () => navigate("/drafts"),
    },
    {
      id: "nav-reminders",
      title: "Scheduled Follow-ups",
      subtitle: "3 active reminders due soon",
      category: "Navigation",
      icon: Clock,
      action: () => navigate("/reminders"),
    },
    {
      id: "nav-dashboard",
      title: "Dashboard Overview",
      subtitle: "Inbox health, stats, and milestone overview",
      category: "Navigation",
      icon: LayoutDashboard,
      action: () => navigate("/dashboard"),
    },
    {
      id: "act-compose",
      title: "Compose New AI Draft",
      subtitle: "Generate reply with tone selection and human approval",
      category: "Action",
      icon: Sparkles,
      action: () => openCompose(),
    },
    {
      id: "act-sync",
      title: "Sync Mailbox Now",
      subtitle: "Fetch latest threads from Gmail API",
      category: "Action",
      icon: RefreshCw,
      action: () => triggerSync(),
    },
    {
      id: "mail-sarah",
      title: "Sarah Chen — Q4 Cloud Budget Approval",
      subtitle: "Urgent: Direct question waiting for signoff",
      category: "Email",
      icon: Mail,
      action: () => navigate("/needs-reply"),
    },
    {
      id: "mail-alex",
      title: "Alex Rivera — Product Design Review",
      subtitle: "Thread with 3 action items and 1 open decision",
      category: "Email",
      icon: Mail,
      action: () => navigate("/summaries"),
    },
    {
      id: "nav-settings",
      title: "Settings & AI Preferences",
      subtitle: "Configure default AI tone, security, and credentials",
      category: "Navigation",
      icon: Settings,
      action: () => navigate("/settings"),
    },
  ];

  const filteredItems = items.filter((item) =>
    `${item.title} ${item.subtitle} ${item.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
      closeCommandPalette();
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-dark/40 backdrop-blur-sm transition-opacity"
        onClick={closeCommandPalette}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-surface-border overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-border bg-surface-offwhite/50">
          <Search className="w-5 h-5 text-forest" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, navigate, or search emails..."
            className="w-full bg-transparent text-sm sm:text-base text-ink-primary font-medium focus:outline-none placeholder:text-ink-muted"
          />
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white border border-surface-border text-[11px] font-mono text-ink-muted">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-ink-muted text-sm">
              No matching commands or emails found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    closeCommandPalette();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-forest text-white shadow-sm"
                      : "hover:bg-surface-offwhite text-ink-primary"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-white/10 text-lime-action"
                          : "bg-surface-offwhite text-forest border border-surface-border"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold truncate">{item.title}</p>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? "text-slate-300" : "text-ink-muted"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-lime-action text-forest"
                          : "bg-surface-offwhite text-ink-muted border border-surface-border"
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 ${
                        isSelected ? "text-lime-action translate-x-0.5" : "text-ink-muted"
                      } transition-transform`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-5 py-3 border-t border-surface-border bg-surface-offwhite/50 flex items-center justify-between text-[11px] text-ink-muted">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1.5 text-forest font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Copilot Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
