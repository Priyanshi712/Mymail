import React, { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  BellRing,
  RotateCcw,
  Sparkles,
  Plus,
  X,
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCondition, setNewCondition] = useState("Remind if no reply within 3 days");
  const [newDueTime, setNewDueTime] = useState("In 3 days (10:00 AM)");

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

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newSubject) return;

    const created: ReminderItem = {
      id: `r-${Date.now()}`,
      recipient: newRecipient || newEmail.split("@")[0],
      recipientEmail: newEmail,
      subject: newSubject,
      condition: newCondition,
      dueTime: newDueTime,
      status: "Upcoming",
    };

    setReminders((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setNewRecipient("");
    setNewEmail("");
    setNewSubject("");
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
            onClick={() => setIsModalOpen(true)}
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

      {/* Schedule Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-forest-dark/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-surface-border p-6 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2 text-forest">
                <div className="w-8 h-8 rounded-xl bg-lime-soft flex items-center justify-center text-forest">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-ink-primary">Schedule Follow-up Reminder</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-surface-offwhite hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink-secondary mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-surface-offwhite border border-surface-border rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-secondary mb-1">Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="alex@designsystems.co"
                  className="w-full bg-surface-offwhite border border-surface-border rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-secondary mb-1">Subject / Thread *</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Contract Signatures & Invoice"
                  className="w-full bg-surface-offwhite border border-surface-border rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-secondary mb-1">Reminder Condition</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full bg-surface-offwhite border border-surface-border rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-forest"
                >
                  <option value="Remind if no reply within 24 hours">Remind if no reply within 24 hours</option>
                  <option value="Remind if no reply within 3 days">Remind if no reply within 3 days</option>
                  <option value="Remind if no reply within 1 week">Remind if no reply within 1 week</option>
                  <option value="Remind regardless of response on due date">Remind regardless of response on due date</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink-secondary mb-1">Due Timing</label>
                <input
                  type="text"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  placeholder="e.g. In 3 days (10:00 AM)"
                  className="w-full bg-surface-offwhite border border-surface-border rounded-xl px-3.5 py-2.5 text-ink-primary focus:outline-none focus:border-forest"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <PillButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </PillButton>
                <PillButton variant="primary" size="sm" type="submit">
                  Save Reminder
                </PillButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
