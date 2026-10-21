import React, { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  BellRing,
  RotateCcw,
  Sparkles,
  Plus,
} from "lucide-react";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";

interface ReminderItem {
  id: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  condition: string;
  dueTime: string;
  status: "Due Today" | "Upcoming" | "Snoozed";
}

export const RemindersPage: React.FC = () => {
  const { openCompose } = useAppShell();

  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: "r1",
      recipient: "David Kross",
      recipientEmail: "david@fintech-advisors.com",
      subject: "Investor Update Draft & Board Deck Review",
      condition: "Remind if no reply within 48 hours of initial send",
      dueTime: "Today at 3:00 PM",
      status: "Due Today",
    },
    {
      id: "r2",
      recipient: "Alex Rivera",
      recipientEmail: "alex@designsystems.co",
      subject: "Updated Figma Components & Token Handoff",
      condition: "Check in on Friday if design assets aren't exported",
      dueTime: "Friday 10:00 AM",
      status: "Upcoming",
    },
    {
      id: "r3",
      recipient: "Elena Rostova",
      recipientEmail: "elena@productlab.dev",
      subject: "Gmail OAuth API Scope Approvals",
      condition: "Snoozed until developer sandbox is provisioned",
      dueTime: "Next Monday 9:00 AM",
      status: "Snoozed",
    },
  ]);

  const handleSnooze = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Snoozed", dueTime: "Snoozed +2 days" } : r
      )
    );
  };

  const handleDismiss = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Due Today":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "Snoozed":
        return "bg-surface-offwhite text-ink-muted border-surface-border";
      default:
        return "bg-lime-light text-forest border-lime-action/40";
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/15 text-forest text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-forest" />
            <span>Persistent Scheduled Reminders (Milestone K)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            Follow-up Reminders
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Never lose track of sent emails. MyMail monitors incoming responses and reminds you to follow up if a contact fails to respond within your desired window.
          </p>
        </div>

        <div className="shrink-0">
          <PillButton
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() =>
              openCompose({
                subject: "Follow-up: Checking in",
                body: "Hi there,\n\nFollowing up on my previous note. Wanted to see if you had a chance to review the details.\n\nBest,\nPriyanshi",
              })
            }
          >
            Schedule New Follow-up
          </PillButton>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-soft-card space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-lime-soft flex items-center justify-center text-forest mx-auto">
              <CheckCircle2 className="w-7 h-7 text-forest" />
            </div>
            <h3 className="font-extrabold text-base text-ink-primary">No active reminders</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              You are caught up on all follow-ups.
            </p>
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card hover:border-lime-action/80 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-forest text-lime-action font-extrabold flex items-center justify-center text-xs shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink-primary">{rem.recipient}</h3>
                    <p className="text-[11px] text-ink-muted">{rem.recipientEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      rem.status
                    )}`}
                  >
                    {rem.status}
                  </span>
                  <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 bg-surface-offwhite px-2.5 py-0.5 rounded-full border border-surface-border">
                    <Calendar className="w-3 h-3 text-forest" /> {rem.dueTime}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-ink-primary">{rem.subject}</h4>
                <div className="p-3 bg-surface-offwhite/50 border border-surface-border rounded-2xl text-xs text-ink-secondary flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-forest shrink-0" />
                  <span>{rem.condition}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleDismiss(rem.id)}
                  className="text-xs font-bold text-ink-muted hover:text-forest transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dismiss Reminder</span>
                </button>

                <div className="flex items-center gap-2">
                  <PillButton
                    variant="secondary"
                    size="sm"
                    icon={<RotateCcw className="w-3 h-3" />}
                    onClick={() => handleSnooze(rem.id)}
                  >
                    Snooze 2 Days
                  </PillButton>

                  <PillButton
                    variant="primary"
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    onClick={() =>
                      openCompose({
                        to: rem.recipientEmail,
                        subject: `Follow-up: ${rem.subject}`,
                        body: `Hi ${rem.recipient.split(" ")[0]},\n\nJust floating this to the top of your inbox. Did you have a chance to look over the details on "${rem.subject}"?\n\nThanks,\nPriyanshi`,
                      })
                    }
                  >
                    Draft Follow-up
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
