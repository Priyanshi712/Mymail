import React, { useState } from "react";
import {
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";

interface NeedsReplyItem {
  id: string;
  sender: string;
  email: string;
  subject: string;
  questionDetected: string;
  urgency: "Urgent" | "High" | "Medium";
  deadline: string;
  received: string;
  snippet: string;
}

export const NeedsReplyPage: React.FC = () => {
  const { openCompose } = useAppShell();

  const [items, setItems] = useState<NeedsReplyItem[]>([
    {
      id: "nr-1",
      sender: "Sarah Chen",
      email: "sarah.chen@acme.corp",
      subject: "Q4 Cloud Infrastructure Budget Sign-off Needed",
      questionDetected: "Direct request: 'Can you confirm if we have green light before 4 PM today?'",
      urgency: "Urgent",
      deadline: "Due today by 4:00 PM",
      received: "15m ago",
      snippet:
        "The forecasted demand requires adding 4 additional GPU nodes to the cluster ($4,200/mo). Could you please review and confirm whether we have executive sign-off?",
    },
    {
      id: "nr-2",
      sender: "Marcus Vance",
      email: "marcus@vancecap.io",
      subject: "Partnership Agreement — Revised Term Sheet",
      questionDetected: "Approval requested on IP indemnification clauses in Section 4.3.",
      urgency: "High",
      deadline: "Due Friday 5:00 PM",
      received: "1h ago",
      snippet:
        "Our legal counsel has integrated your notes. Attached is the redlined version for your final stamp of approval.",
    },
    {
      id: "nr-3",
      sender: "David Kross",
      email: "david@fintech-advisors.com",
      subject: "Investor Update Draft & Board Deck Review",
      questionDetected: "Action item: 'Please review slide 8 (MRR Growth) and verify the numbers.'",
      urgency: "High",
      deadline: "Due tomorrow 12:00 PM",
      received: "4h ago",
      snippet:
        "We are compiling the quarterly investor deck. Need your sign-off specifically on slide 8 before distribution.",
    },
    {
      id: "nr-4",
      sender: "Nadia Patel",
      email: "nadia@devteam.io",
      subject: "Candidate Interview Feedback — Staff Engineer Candidate",
      questionDetected: "Scorecard submission requested for Alex Chen's technical interview.",
      urgency: "Medium",
      deadline: "Within 24 hours",
      received: "5h ago",
      snippet:
        "Hey! Please remember to submit your interview scorecard and hire/no-hire decision in Greenhouse.",
    },
  ]);

  const handleResolve = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Urgent":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "High":
        return "bg-amber-100 text-amber-900 border-amber-300";
      default:
        return "bg-lime-light text-forest border-lime-action/40";
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Smart Priority Heuristics Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            Needs-Reply Attention Queue
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            The AI Copilot scans your incoming email threads for direct questions, pending approvals, and action deadlines so you never leave a high-priority contact waiting.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-offwhite rounded-2xl p-4 border border-surface-border shrink-0">
          <div className="text-center px-2">
            <span className="block text-2xl font-extrabold text-forest">{items.length}</span>
            <span className="text-[10px] text-ink-muted uppercase font-bold">Pending</span>
          </div>
          <div className="h-8 w-px bg-surface-border" />
          <div className="text-center px-2">
            <span className="block text-2xl font-extrabold text-amber-600">
              {items.filter((i) => i.urgency === "Urgent").length}
            </span>
            <span className="text-[10px] text-ink-muted uppercase font-bold">Urgent</span>
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-soft-card space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-lime-soft flex items-center justify-center text-forest mx-auto">
              <CheckCircle2 className="w-7 h-7 text-forest" />
            </div>
            <h3 className="font-extrabold text-base text-ink-primary">Queue is clear!</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              No emails currently require your immediate reply. The AI Copilot will flag new incoming threads as they arrive.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card hover:border-lime-action/80 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-forest text-lime-action font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {item.sender.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-primary">{item.sender}</h3>
                    <p className="text-xs text-ink-muted">{item.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(
                      item.urgency
                    )}`}
                  >
                    {item.urgency}
                  </span>
                  <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 bg-surface-offwhite px-2.5 py-0.5 rounded-full border border-surface-border">
                    <Clock className="w-3 h-3 text-amber-500" /> {item.deadline}
                  </span>
                </div>
              </div>

              {/* Subject & Reason */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-ink-primary">{item.subject}</h2>
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Detected Reason: </span>
                    <span>{item.questionDetected}</span>
                  </div>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed bg-surface-offwhite/50 p-3.5 rounded-2xl border border-surface-border/50">
                  {item.snippet}
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleResolve(item.id)}
                  className="text-xs font-bold text-ink-muted hover:text-forest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </button>

                <div className="flex items-center gap-3">
                  <PillButton
                    variant="primary"
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5 text-forest" />}
                    onClick={() =>
                      openCompose({
                        to: item.email,
                        subject: `Re: ${item.subject}`,
                      })
                    }
                  >
                    Draft Reply with AI
                  </PillButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
