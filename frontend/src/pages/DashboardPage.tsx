import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Inbox,
  Flame,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Zap,
  Activity,
  Check,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";
import { api } from "../services/api";
import type {
  InboxHealthMetrics,
  PriorityThreadItem,
  RecentActivityItem,
} from "../types/dashboard";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openCompose, triggerSync, isSyncing } = useAppShell();

  const [metrics, setMetrics] = useState<InboxHealthMetrics>({
    total_unread: 12,
    needs_reply_count: 4,
    ai_summaries_count: 8,
    followups_due_today: 3,
    inbox_zero_percentage: 68.5,
    avg_response_time_hours: 1.8,
    safe_send_active: true,
  });

  const [priorityQueue, setPriorityQueue] = useState<PriorityThreadItem[]>([
    {
      id: "t1",
      sender_name: "Sarah Chen",
      sender_email: "sarah.chen@acme.corp",
      subject: "Q4 Cloud Infrastructure Budget Sign-off Needed",
      snippet:
        "Can you confirm if we have green light for the additional compute clusters before 4 PM today?",
      urgency: "Urgent",
      deadline: "Due today 4:00 PM",
      time_ago: "15m ago",
      category: "Budget",
      resolved: false,
    },
    {
      id: "t2",
      sender_name: "Marcus Vance",
      sender_email: "marcus@vancecap.io",
      subject: "Partnership Agreement — Revised Term Sheet",
      snippet:
        "Please review the updated IP clauses in Section 4.3 and let us know your team's feedback.",
      urgency: "High",
      deadline: "Due Friday 5:00 PM",
      time_ago: "1h ago",
      category: "Legal",
      resolved: false,
    },
    {
      id: "t3",
      sender_name: "Elena Rostova",
      sender_email: "elena@productlab.dev",
      subject: "API Integration Milestone Review",
      snippet:
        "Drafted the endpoint specifications for the Gmail OAuth token refresh. Does this match your schema?",
      urgency: "Medium",
      deadline: "Within 24 hours",
      time_ago: "3h ago",
      category: "Engineering",
      resolved: false,
    },
    {
      id: "t4",
      sender_name: "David Kross",
      sender_email: "david@fintech-advisors.com",
      subject: "Investor Update Draft & Board Deck Review",
      snippet:
        "Please review slide 8 (MRR Growth) and verify the numbers before we circulate to partners.",
      urgency: "High",
      deadline: "Due tomorrow 12:00 PM",
      time_ago: "4h ago",
      category: "Investors",
      resolved: false,
    },
  ]);

  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([
    {
      id: "act-1",
      action: "AI Summary Generated",
      description: "Distilled 8 messages on 'Q4 Cloud Infrastructure Scaling'.",
      timestamp: "20m ago",
      type: "summary",
    },
    {
      id: "act-2",
      action: "Urgent Thread Flagged",
      description: "Sarah Chen requested compute sign-off before 4 PM.",
      timestamp: "1h ago",
      type: "reply",
    },
    {
      id: "act-3",
      action: "Mailbox Synced",
      description: "Gmail API synchronization completed cleanly.",
      timestamp: "2h ago",
      type: "sync",
    },
    {
      id: "act-4",
      action: "Follow-up Reminder Set",
      description: "Scheduled reminder for Alex Rivera on Friday 10:00 AM.",
      timestamp: "3h ago",
      type: "reminder",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [triageFeedback, setTriageFeedback] = useState<string | null>(null);

  // Fetch live overview from backend
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        const data = await api.getDashboardOverview();
        if (data && data.metrics) {
          setMetrics(data.metrics);
          setPriorityQueue(data.priority_queue);
          setRecentActivities(data.recent_activity);
        }
      } catch {
        // Fall back gracefully to initial demo state if offline
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleTriageAction = async (threadId: string, action: "resolve" | "snooze" | "drafted") => {
    // Optimistic UI update
    setPriorityQueue((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, resolved: true } : t))
    );

    setMetrics((prev) => {
      const remaining = Math.max(0, prev.needs_reply_count - 1);
      const total = priorityQueue.length;
      const resolved = total - remaining;
      const pct = Math.min(100, Math.round((resolved / total) * 100));
      return {
        ...prev,
        needs_reply_count: remaining,
        total_unread: Math.max(0, prev.total_unread - 1),
        inbox_zero_percentage: pct,
      };
    });

    try {
      const res = await api.triageThread(threadId, action);
      if (res && res.updated_metrics) {
        setMetrics(res.updated_metrics);
      }
      setTriageFeedback(res.message);
      setTimeout(() => setTriageFeedback(null), 3000);
    } catch {
      setTriageFeedback(`Thread marked as ${action}`);
      setTimeout(() => setTriageFeedback(null), 3000);
    }
  };

  const statCards = [
    {
      title: "Unread Messages",
      value: metrics.total_unread,
      change: "+3 this morning",
      icon: Inbox,
      link: "/inbox",
      color: "bg-lime-soft/80 text-forest border-lime-action",
    },
    {
      title: "Needs Reply",
      value: metrics.needs_reply_count,
      change: "Direct inquiries",
      icon: Flame,
      link: "/needs-reply",
      color: "bg-amber-100/90 text-amber-900 border-amber-300",
    },
    {
      title: "AI Summaries",
      value: metrics.ai_summaries_count,
      change: "~35m reading saved",
      icon: Sparkles,
      link: "/summaries",
      color: "bg-forest/10 text-forest border-forest/20",
    },
    {
      title: "Follow-ups Due",
      value: metrics.followups_due_today,
      change: "1 due today",
      icon: Clock,
      link: "/reminders",
      color: "bg-surface-offwhite text-ink-primary border-surface-border",
    },
  ];

  const activeQueue = priorityQueue.filter((t) => !t.resolved);

  return (
    <div className="space-y-8 select-none">
      {/* High-Impact Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-forest via-forest-light to-forest-muted rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-soft-card border border-forest-light/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-lime-action text-xs font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">
              <Zap className="w-3.5 h-3.5 text-lime-action" />
              <span>Real-Time Inbox Health • Milestone C Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Welcome back, {user?.full_name?.split(" ")[0]}!
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Your inbox triage rate is currently at{" "}
              <strong className="text-lime-action font-extrabold">
                {metrics.inbox_zero_percentage}%
              </strong>
              . You have{" "}
              <strong className="text-lime-action font-bold">
                {activeQueue.length} priority items
              </strong>{" "}
              needing review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <PillButton
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4 text-forest" />}
              onClick={() => openCompose()}
            >
              Compose with AI
            </PillButton>

            <button
              onClick={triggerSync}
              disabled={isSyncing || isLoading}
              className="px-4 py-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Health"}</span>
            </button>
          </div>
        </div>

        {/* Decorative Radial Elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-lime-action/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-forest-light/30 blur-2xl pointer-events-none" />
      </section>

      {/* Triage Feedback Notification */}
      {triageFeedback && (
        <div className="p-4 rounded-2xl bg-lime-soft border border-lime-action text-forest text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-soft-card">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
            <span>{triageFeedback}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-forest-muted">
            Metrics Updated
          </span>
        </div>
      )}

      {/* Metrics Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card hover:border-lime-action/80 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-secondary">{stat.title}</span>
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${stat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight text-ink-primary">
                  {stat.value}
                </span>
                <p className="text-xs text-ink-muted mt-1 font-medium">{stat.change}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs font-bold text-forest">
                <span>View items</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Inbox Zero Progress & Velocity Bar */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-forest" />
              <h2 className="text-sm font-extrabold text-ink-primary uppercase tracking-wider">
                Inbox Zero Health & Turnaround Velocity
              </h2>
            </div>
            <p className="text-xs text-ink-muted">
              Average response time:{" "}
              <strong className="text-forest font-bold">
                {metrics.avg_response_time_hours} hours
              </strong>{" "}
              • Human-in-the-loop protection:{" "}
              <strong className="text-emerald-700 font-bold">Active</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-forest font-mono">
              {metrics.inbox_zero_percentage}%
            </span>
            <span className="text-xs font-bold text-ink-secondary">Triage Score</span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full bg-surface-offwhite rounded-full h-3.5 border border-surface-border overflow-hidden flex">
          <div
            className="bg-forest transition-all duration-500 rounded-l-full"
            style={{ width: `${metrics.inbox_zero_percentage}%` }}
          />
          <div
            className="bg-lime-action transition-all duration-500"
            style={{
              width: `${Math.max(
                0,
                100 - metrics.inbox_zero_percentage - activeQueue.length * 5
              )}%`,
            }}
          />
          <div
            className="bg-amber-400 transition-all duration-500 rounded-r-full"
            style={{ width: `${activeQueue.length * 5}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span>Resolved</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lime-action" />
              <span>In Staging</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Pending Action ({activeQueue.length})</span>
            </span>
          </div>
          <span>Goal: 100% Inbox Zero</span>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Priority Attention Queue with live Triage */}
        <section className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-extrabold text-ink-primary tracking-tight">
                  Priority Attention Queue
                </h2>
              </div>
              <p className="text-xs text-ink-muted">
                Incoming conversations classified by urgency and awaiting your sign-off or response.
              </p>
            </div>

            <Link
              to="/needs-reply"
              className="text-xs font-bold text-forest hover:text-forest-light inline-flex items-center gap-1 shrink-0"
            >
              View all ({activeQueue.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeQueue.length === 0 ? (
              <div className="p-8 text-center bg-surface-offwhite rounded-2xl border border-surface-border space-y-2">
                <CheckCircle2 className="w-8 h-8 text-forest mx-auto" />
                <h3 className="font-bold text-sm text-ink-primary">Attention queue cleared!</h3>
                <p className="text-xs text-ink-muted">All high-priority inquiries have been resolved.</p>
              </div>
            ) : (
              activeQueue.map((thread) => (
                <div
                  key={thread.id}
                  className="p-4 sm:p-5 rounded-2xl bg-surface-offwhite border border-surface-border hover:border-lime-action/80 hover:bg-white hover:shadow-soft-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-ink-primary">{thread.sender_name}</span>
                      <span className="text-[11px] text-ink-muted hidden sm:inline">
                        • {thread.sender_email}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          thread.urgency === "Urgent"
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {thread.urgency}
                      </span>
                      <span className="text-[11px] text-ink-muted ml-auto sm:ml-0">
                        {thread.time_ago}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink-primary truncate group-hover:text-forest transition-colors">
                      {thread.subject}
                    </h3>

                    <p className="text-xs text-ink-secondary line-clamp-1">{thread.snippet}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {/* Mark Resolved Button */}
                    <button
                      onClick={() => handleTriageAction(thread.id, "resolve")}
                      title="Mark as Resolved"
                      className="w-8 h-8 rounded-full bg-white border border-surface-border hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    {/* Snooze Button */}
                    <button
                      onClick={() => handleTriageAction(thread.id, "snooze")}
                      title="Snooze 2 Days"
                      className="w-8 h-8 rounded-full bg-white border border-surface-border hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Draft Reply Button */}
                    <button
                      onClick={() => {
                        handleTriageAction(thread.id, "drafted");
                        openCompose({
                          to: thread.sender_email,
                          subject: `Re: ${thread.subject}`,
                        });
                      }}
                      className="px-3.5 py-2 rounded-full bg-forest text-lime-action hover:bg-forest-light text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft Reply</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right 1 Col: Live Copilot Activity & Roadmap */}
        <div className="space-y-6">
          {/* Recent AI Copilot Activity */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <h3 className="font-bold text-sm text-ink-primary">Copilot Activity Feed</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-light text-forest border border-lime-action/40">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-xl bg-forest/5 border border-forest/10 flex items-center justify-center text-forest shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-ink-primary truncate">{act.action}</span>
                      <span className="text-[10px] text-ink-muted whitespace-nowrap">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary mt-0.5 leading-snug">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Capabilities Progress */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink-primary">Roadmap Progress</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lime-light text-forest border border-lime-action/40">
                Milestone C Done
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-lime-light/40 border border-lime-action/30 text-forest font-semibold">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span>A. Authentication & Design System</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-lime-light/40 border border-lime-action/30 text-forest font-semibold">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span>B. Application Shell & Navigation</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-lime-light/40 border border-lime-action/30 text-forest font-semibold">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span>C. Dashboard Overview & Inbox Health</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-offwhite border border-surface-border text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>D. Gmail API OAuth Provider Connection (Next)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
