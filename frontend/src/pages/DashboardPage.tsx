import React from "react";
import { Link } from "react-router-dom";
import {
  Inbox,
  Flame,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openCompose } = useAppShell();

  const stats = [
    {
      title: "Unread Messages",
      value: "12",
      change: "+3 this morning",
      icon: Inbox,
      link: "/inbox",
      color: "bg-lime-soft/80 text-forest border-lime-action",
      accent: "text-forest",
    },
    {
      title: "Needs Reply",
      value: "4",
      change: "2 high priority",
      icon: Flame,
      link: "/needs-reply",
      color: "bg-amber-100/90 text-amber-900 border-amber-300",
      accent: "text-amber-800",
    },
    {
      title: "AI Summaries Ready",
      value: "8",
      change: "Saved ~35 mins reading",
      icon: Sparkles,
      link: "/summaries",
      color: "bg-forest/10 text-forest border-forest/20",
      accent: "text-forest",
    },
    {
      title: "Follow-up Reminders",
      value: "3",
      change: "1 due today",
      icon: Clock,
      link: "/reminders",
      color: "bg-surface-offwhite text-ink-primary border-surface-border",
      accent: "text-ink-secondary",
    },
  ];

  const urgentThreads = [
    {
      id: "t1",
      sender: "Sarah Chen",
      email: "sarah.chen@acme.corp",
      subject: "Q4 Cloud Infrastructure Budget Sign-off Needed",
      snippet: "Can you confirm if we have green light for the additional compute clusters before 4 PM?",
      urgency: "High Priority",
      urgencyColor: "bg-rose-100 text-rose-800 border-rose-200",
      received: "15m ago",
    },
    {
      id: "t2",
      sender: "Marcus Vance",
      email: "marcus@vancecap.io",
      subject: "Partnership Agreement — Revised Term Sheet",
      snippet: "Please review the updated IP clauses in Section 4.3 and let us know your team's feedback.",
      urgency: "Reply Needed",
      urgencyColor: "bg-amber-100 text-amber-800 border-amber-200",
      received: "1h ago",
    },
    {
      id: "t3",
      sender: "Elena Rostova",
      email: "elena@productlab.dev",
      subject: "API Integration Milestone Review",
      snippet: "Drafted the endpoint specifications for the Gmail OAuth token refresh. Does this match your schema?",
      urgency: "Review Needed",
      urgencyColor: "bg-lime-light text-forest border-lime-action/40",
      received: "3h ago",
    },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome & High-Impact Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-forest via-forest-light to-forest-muted rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-soft-card border border-forest-light/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-lime-action text-xs font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-lime-action" />
              <span>AI Copilot Active • Milestone B Operational</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Good evening, {user?.full_name?.split(" ")[0]}!
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Your inbox is organized. You have <strong className="text-lime-action font-bold">4 messages</strong> needing a reply and <strong className="text-lime-action font-bold">8 AI summaries</strong> ready for review. Human-in-the-loop safety lock is active.
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

            <Link to="/needs-reply">
              <PillButton
                variant="secondary"
                size="md"
                className="w-full sm:w-auto bg-white/15 text-white hover:bg-white/25 border-white/20"
              >
                Review Priority Queue
              </PillButton>
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-lime-action/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-forest-light/30 blur-2xl pointer-events-none" />
      </section>

      {/* Metrics Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Priority Needs-Reply Queue */}
        <section className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-extrabold text-ink-primary tracking-tight">
                  Needs-Reply Attention Queue
                </h2>
              </div>
              <p className="text-xs text-ink-muted">
                AI has identified incoming threads that require your explicit response or approval.
              </p>
            </div>

            <Link
              to="/needs-reply"
              className="text-xs font-bold text-forest hover:text-forest-light inline-flex items-center gap-1 shrink-0"
            >
              View all 4 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {urgentThreads.map((thread) => (
              <div
                key={thread.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface-offwhite border border-surface-border hover:border-lime-action/80 hover:bg-white hover:shadow-soft-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-ink-primary">{thread.sender}</span>
                    <span className="text-[11px] text-ink-muted hidden sm:inline">• {thread.email}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${thread.urgencyColor}`}
                    >
                      {thread.urgency}
                    </span>
                    <span className="text-[11px] text-ink-muted ml-auto sm:ml-0">{thread.received}</span>
                  </div>

                  <h3 className="text-sm font-bold text-ink-primary truncate group-hover:text-forest transition-colors">
                    {thread.subject}
                  </h3>

                  <p className="text-xs text-ink-secondary line-clamp-1">{thread.snippet}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() =>
                      openCompose({
                        to: thread.email,
                        subject: `Re: ${thread.subject}`,
                      })
                    }
                    className="px-3.5 py-2 rounded-full bg-forest text-lime-action hover:bg-forest-light text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Draft Reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right 1 Col: AI Copilot Insights & Roadmap Status */}
        <div className="space-y-6">
          {/* Safety Rule Card */}
          <div className="bg-gradient-to-br from-lime-light/60 to-white rounded-3xl p-6 border border-lime-action/50 shadow-soft-card space-y-3">
            <div className="flex items-center gap-2.5 text-forest">
              <div className="w-8 h-8 rounded-xl bg-lime-action/40 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-forest" />
              </div>
              <h3 className="font-extrabold text-sm">Human-in-the-Loop Safe</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              No email will ever be dispatched, archived, or deleted without your explicit manual review of the recipient, subject, and content.
            </p>
          </div>

          {/* Project Capabilities Progress */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink-primary">Roadmap Status</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lime-light text-forest border border-lime-action/40">
                Milestone B Done
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-lime-light/40 border border-lime-action/30 text-forest font-semibold">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span>A. Full Authentication & Design System</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-lime-light/40 border border-lime-action/30 text-forest font-semibold">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span>B. Application Shell & Navigation</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-offwhite border border-surface-border text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>C. Dashboard Overview & Health (Next)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-offwhite border border-surface-border text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                <span>D. Gmail API OAuth Provider Connection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
