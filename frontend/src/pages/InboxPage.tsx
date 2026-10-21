import React, { useState } from "react";
import {
  Inbox,
  Search,
  Star,
  Sparkles,
  Flame,
  CornerUpLeft,
} from "lucide-react";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";

interface EmailThread {
  id: string;
  sender: string;
  senderEmail: string;
  avatar: string;
  subject: string;
  snippet: string;
  fullBody: string;
  timestamp: string;
  isUnread: boolean;
  isStarred: boolean;
  needsReply?: boolean;
  hasSummary?: boolean;
  summaryBullets?: string[];
  tag: string;
}

export const InboxPage: React.FC = () => {
  const { openCompose } = useAppShell();

  const [threads, setThreads] = useState<EmailThread[]>([
    {
      id: "1",
      sender: "Sarah Chen",
      senderEmail: "sarah.chen@acme.corp",
      avatar: "SC",
      subject: "Q4 Cloud Infrastructure Budget Sign-off Needed",
      snippet: "Can you confirm if we have green light for the additional compute clusters before 4 PM today?",
      fullBody:
        "Hi Team,\n\nFollowing up on our infrastructure scaling discussion yesterday. The forecasted demand for Q4 requires adding 4 additional GPU nodes to the cluster. Total monthly allocation is $4,200.\n\nCould you please review and confirm whether we have executive sign-off before 4:00 PM today?\n\nThanks,\nSarah Chen\nVP of Engineering",
      timestamp: "10:24 AM",
      isUnread: true,
      isStarred: true,
      needsReply: true,
      hasSummary: true,
      summaryBullets: [
        "Requesting budget approval for 4 additional GPU nodes ($4,200/mo).",
        "Action needed: Confirm executive green light by 4:00 PM today.",
      ],
      tag: "Budget",
    },
    {
      id: "2",
      sender: "Marcus Vance",
      senderEmail: "marcus@vancecap.io",
      avatar: "MV",
      subject: "Partnership Agreement — Revised Term Sheet",
      snippet: "Please review the updated IP clauses in Section 4.3 and let us know your team's feedback.",
      fullBody:
        "Good morning,\n\nOur legal counsel has integrated your notes regarding IP indemnification in Section 4.3. Attached is the redlined version for your final stamp of approval.\n\nLooking forward to wrapping this up by Friday.\n\nBest,\nMarcus Vance",
      timestamp: "Yesterday",
      isUnread: true,
      isStarred: false,
      needsReply: true,
      hasSummary: true,
      summaryBullets: [
        "Updated IP clauses according to previous negotiation.",
        "Awaiting final stamp of approval by Friday.",
      ],
      tag: "Legal",
    },
    {
      id: "3",
      sender: "GitHub Notifications",
      senderEmail: "notifications@github.com",
      avatar: "GH",
      subject: "[Priyanshi712/Mymail] Run succeeded: Production Verification",
      snippet: "All 14 checks passed in 48s. Milestone B shell modules verified cleanly.",
      fullBody:
        "Run #102 on branch main has completed successfully.\n\n- TypeScript Compiler: 0 errors\n- FastApi Test Suite: 10 passed\n- Security Audit: 0 vulnerabilities found.",
      timestamp: "Oct 20",
      isUnread: false,
      isStarred: false,
      tag: "CI/CD",
    },
    {
      id: "4",
      sender: "Elena Rostova",
      senderEmail: "elena@productlab.dev",
      avatar: "ER",
      subject: "API Integration Milestone Review",
      snippet: "Drafted the endpoint specifications for the Gmail OAuth token refresh. Does this match your schema?",
      fullBody:
        "Hey Priyanshi,\n\nI just finished writing the endpoint documentation for the Gmail OAuth token refresh workflow. I've sent the Swagger specs over for your review. Take a look when you have a moment!\n\nElena",
      timestamp: "Oct 19",
      isUnread: false,
      isStarred: true,
      needsReply: false,
      hasSummary: true,
      summaryBullets: [
        "Delivered Gmail OAuth refresh specs for verification.",
        "Non-blocking review requested.",
      ],
      tag: "Engineering",
    },
  ]);

  const [selectedId, setSelectedId] = useState<string>("1");
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "needs-reply">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedThread = threads.find((t) => t.id === selectedId) || threads[0];

  const filteredThreads = threads.filter((t) => {
    if (filter === "unread" && !t.isUnread) return false;
    if (filter === "starred" && !t.isStarred) return false;
    if (filter === "needs-reply" && !t.needsReply) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.subject.toLowerCase().includes(q) ||
        t.sender.toLowerCase().includes(q) ||
        t.snippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleStarred = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isStarred: !t.isStarred } : t))
    );
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-surface-border shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filter === "all"
                ? "bg-forest text-lime-action shadow-xs"
                : "bg-surface-offwhite text-ink-secondary hover:bg-surface-hover"
            }`}
          >
            All Mail ({threads.length})
          </button>

          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filter === "unread"
                ? "bg-forest text-lime-action shadow-xs"
                : "bg-surface-offwhite text-ink-secondary hover:bg-surface-hover"
            }`}
          >
            Unread ({threads.filter((t) => t.isUnread).length})
          </button>

          <button
            onClick={() => setFilter("needs-reply")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filter === "needs-reply"
                ? "bg-forest text-lime-action shadow-xs"
                : "bg-surface-offwhite text-ink-secondary hover:bg-surface-hover"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Needs Reply ({threads.filter((t) => t.needsReply).length})</span>
          </button>

          <button
            onClick={() => setFilter("starred")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filter === "starred"
                ? "bg-forest text-lime-action shadow-xs"
                : "bg-surface-offwhite text-ink-secondary hover:bg-surface-hover"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Starred ({threads.filter((t) => t.isStarred).length})</span>
          </button>
        </div>

        {/* Search bar inside inbox */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter current view..."
            className="w-full bg-surface-offwhite border border-surface-border rounded-full pl-9 pr-4 py-2 text-xs text-ink-primary focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      {/* Split-Pane Inbox Client View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Column: Email Thread List (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-surface-border shadow-soft-card overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-surface-border bg-surface-offwhite/50 flex items-center justify-between text-xs font-bold text-ink-secondary">
            <span>Conversations</span>
            <span>{filteredThreads.length} items</span>
          </div>

          <div className="divide-y divide-surface-border overflow-y-auto max-h-[620px] flex-1">
            {filteredThreads.length === 0 ? (
              <div className="p-12 text-center text-ink-muted text-xs">
                No conversations found matching this filter.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setSelectedId(thread.id);
                      if (thread.isUnread) {
                        setThreads((prev) =>
                          prev.map((t) =>
                            t.id === thread.id ? { ...t, isUnread: false } : t
                          )
                        );
                      }
                    }}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-lime-light/35 border-l-4 border-l-forest"
                        : "hover:bg-surface-offwhite"
                    } ${thread.isUnread ? "font-bold" : ""}`}
                  >
                    {/* Sender Avatar */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        thread.isUnread
                          ? "bg-forest text-lime-action shadow-xs"
                          : "bg-surface-offwhite border border-surface-border text-ink-secondary"
                      }`}
                    >
                      {thread.avatar}
                    </div>

                    {/* Thread Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-ink-primary truncate font-bold">
                          {thread.sender}
                        </span>
                        <span className="text-[10px] text-ink-muted whitespace-nowrap">
                          {thread.timestamp}
                        </span>
                      </div>

                      <h4 className="text-xs text-ink-primary truncate">
                        {thread.subject}
                      </h4>

                      <p className="text-[11px] text-ink-muted line-clamp-1 font-normal">
                        {thread.snippet}
                      </p>

                      <div className="flex items-center gap-1.5 pt-1">
                        {thread.needsReply && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-bold">
                            Needs Reply
                          </span>
                        )}
                        {thread.hasSummary && (
                          <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest text-[9px] font-bold">
                            AI Summary
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded-md bg-surface-offwhite text-ink-muted text-[9px]">
                          {thread.tag}
                        </span>
                      </div>
                    </div>

                    {/* Star Toggle */}
                    <button
                      onClick={(e) => toggleStarred(thread.id, e)}
                      className="p-1 text-ink-muted hover:text-amber-400 transition-colors"
                      title={thread.isStarred ? "Starred" : "Not starred"}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          thread.isStarred ? "text-amber-400 fill-amber-400" : ""
                        }`}
                      />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Reader Pane (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-surface-border shadow-soft-card p-6 flex flex-col justify-between space-y-6">
          {selectedThread ? (
            <div className="space-y-6">
              {/* Thread Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-border">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-lime-light text-forest border border-lime-action/40 text-xs font-bold">
                      {selectedThread.tag}
                    </span>
                    {selectedThread.needsReply && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-600" /> Urgent Reply Required
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-extrabold text-ink-primary leading-tight">
                    {selectedThread.subject}
                  </h2>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-2xl bg-forest text-lime-action font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {selectedThread.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink-primary">
                          {selectedThread.sender}
                        </span>
                        <span className="text-xs text-ink-muted">
                          &lt;{selectedThread.senderEmail}&gt;
                        </span>
                      </div>
                      <span className="text-xs text-ink-muted">
                        Received {selectedThread.timestamp} (Synced via Gmail API)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => toggleStarred(selectedThread.id, e)}
                    className="p-2 rounded-xl hover:bg-surface-offwhite text-ink-muted hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        selectedThread.isStarred ? "text-amber-400 fill-amber-400" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* AI Distilled Summary Box */}
              {selectedThread.hasSummary && selectedThread.summaryBullets && (
                <div className="bg-gradient-to-r from-forest/5 to-lime-soft/15 rounded-2xl p-4 border border-surface-border space-y-2">
                  <div className="flex items-center gap-2 text-forest">
                    <Sparkles className="w-4 h-4 text-forest" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      AI Thread Distillation
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-ink-secondary pl-5 list-disc">
                    {selectedThread.summaryBullets.map((bullet, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Email Message Content */}
              <div className="prose max-w-none text-xs sm:text-sm text-ink-primary leading-relaxed whitespace-pre-line font-sans bg-surface-offwhite/30 rounded-2xl p-5 border border-surface-border/50">
                {selectedThread.fullBody}
              </div>

              {/* Quick AI Reply Bar */}
              <div className="p-4 rounded-2xl bg-surface-offwhite border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-ink-secondary text-xs font-medium">
                  <Sparkles className="w-4 h-4 text-forest" />
                  <span>Draft a response with human approval</span>
                </div>

                <div className="flex items-center gap-2">
                  <PillButton
                    variant="primary"
                    size="sm"
                    icon={<CornerUpLeft className="w-3.5 h-3.5" />}
                    onClick={() =>
                      openCompose({
                        to: selectedThread.senderEmail,
                        subject: `Re: ${selectedThread.subject}`,
                      })
                    }
                  >
                    Draft Reply with AI
                  </PillButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 text-ink-muted">
              <Inbox className="w-12 h-12 text-ink-muted/50 mb-3" />
              <p className="text-sm font-semibold">Select a conversation to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
