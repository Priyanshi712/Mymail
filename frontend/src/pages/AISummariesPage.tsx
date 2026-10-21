import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ListTodo,
  ArrowRight,
  User,
  CornerUpLeft,
} from "lucide-react";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";

interface ThreadSummaryData {
  id: string;
  topic: string;
  participants: string[];
  totalMessages: number;
  timeframe: string;
  tldr: string;
  keyConclusions: string[];
  openQuestions: string[];
  actionItems: {
    task: string;
    assignee: string;
    deadline: string;
    done: boolean;
  }[];
}

export const AISummariesPage: React.FC = () => {
  const { openCompose } = useAppShell();

  const summaries: ThreadSummaryData[] = [
    {
      id: "sum-1",
      topic: "Q4 Infrastructure Expansion & GPU Node Procurement",
      participants: ["Sarah Chen", "DevOps Team", "Finance Dept"],
      totalMessages: 8,
      timeframe: "Last updated 2 hours ago",
      tldr: "Engineering requires 4 additional GPU compute nodes to support forecasted ML inference traffic for Q4 ($4,200/mo). Budget is cleared pending final executive confirmation.",
      keyConclusions: [
        "Current cluster capacity will reach 92% utilization within 3 weeks without upgrades.",
        "Monthly cloud budget can absorb the $4,200 cost under the approved Q4 R&D allocation.",
        "Delivery and provisioning will take 48 hours once purchase order is authorized.",
      ],
      openQuestions: [
        "Will multi-region redundancy be enabled immediately or phased in November?",
        "Who is the designated secondary on-call during the weekend migration?",
      ],
      actionItems: [
        {
          task: "Confirm executive budget sign-off before 4 PM",
          assignee: "Priyanshi (You)",
          deadline: "Today 4:00 PM",
          done: false,
        },
        {
          task: "Prepare Terraform scripts for cluster deployment",
          assignee: "Sarah Chen",
          deadline: "Tomorrow 10:00 AM",
          done: true,
        },
        {
          task: "Set up Grafana alerts for node saturation",
          assignee: "DevOps Team",
          deadline: "Friday",
          done: false,
        },
      ],
    },
    {
      id: "sum-2",
      topic: "Enterprise License & Partnership Term Sheet Review",
      participants: ["Marcus Vance", "Legal Counsel", "Product Leadership"],
      totalMessages: 12,
      timeframe: "Yesterday",
      tldr: "Term sheet revisions completed for the enterprise data partnership. Section 4.3 indemnification updated to mutual standard. Awaiting final countersignature.",
      keyConclusions: [
        "Intellectual property clauses modified to guarantee customer data sovereignty.",
        "Payment terms locked to Net-30 with an annual commitment discount of 15%.",
      ],
      openQuestions: [
        "Does the agreement require board notification under current governance policies?",
      ],
      actionItems: [
        {
          task: "Review Section 4.3 redlines",
          assignee: "Legal & Priyanshi",
          deadline: "Friday 5:00 PM",
          done: false,
        },
        {
          task: "Generate final signature packet in DocuSign",
          assignee: "Marcus Vance",
          deadline: "Monday",
          done: false,
        },
      ],
    },
  ];

  const [selectedSummaryId, setSelectedSummaryId] = useState<string>("sum-1");
  const activeSummary = summaries.find((s) => s.id === selectedSummaryId) || summaries[0];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/15 text-forest text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            <span>Structured Thread Distillation (Milestone G & H)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            AI Thread Summaries & Conclusions
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Long multi-party email chains distilled into executive TL;DRs, firm decisions, open questions, and trackable action items with deadlines.
          </p>
        </div>

        <div className="shrink-0">
          <PillButton
            variant="primary"
            size="md"
            icon={<CornerUpLeft className="w-4 h-4" />}
            onClick={() =>
              openCompose({
                subject: `Re: ${activeSummary.topic}`,
                body: `Regarding our conclusions on "${activeSummary.topic}":\n\nI confirm alignment on the action items discussed.\n\nBest,\nPriyanshi`,
              })
            }
          >
            Reply with Context
          </PillButton>
        </div>
      </div>

      {/* Selector & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left selector sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted px-2">
            Summarized Threads ({summaries.length})
          </h3>

          <div className="space-y-3">
            {summaries.map((sum) => {
              const isSelected = sum.id === selectedSummaryId;
              return (
                <div
                  key={sum.id}
                  onClick={() => setSelectedSummaryId(sum.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-forest shadow-soft-card ring-2 ring-forest/10"
                      : "bg-white/80 border-surface-border hover:bg-white hover:border-lime-action/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-ink-muted mb-2">
                    <span className="font-semibold text-forest">
                      {sum.totalMessages} messages
                    </span>
                    <span>{sum.timeframe}</span>
                  </div>

                  <h4 className="text-sm font-bold text-ink-primary leading-snug">
                    {sum.topic}
                  </h4>

                  <p className="text-xs text-ink-secondary mt-2 line-clamp-2 leading-relaxed">
                    {sum.tldr}
                  </p>

                  <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs font-bold text-forest">
                    <span>Inspect distillation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Viewer (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-surface-border shadow-soft-card p-6 sm:p-8 space-y-6">
          {/* Header of Active Summary */}
          <div className="space-y-3 pb-6 border-b border-surface-border">
            <div className="flex items-center gap-2 flex-wrap text-xs text-ink-muted">
              <span className="px-2.5 py-0.5 rounded-full bg-lime-light text-forest border border-lime-action/40 font-bold">
                Distilled via AI
              </span>
              <span>•</span>
              <span>Participants: {activeSummary.participants.join(", ")}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-ink-primary leading-tight">
              {activeSummary.topic}
            </h2>

            {/* TLDR Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-forest/5 to-lime-soft/10 border border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-forest block mb-1">
                Executive TL;DR
              </span>
              <p className="text-xs sm:text-sm text-ink-primary font-medium leading-relaxed">
                {activeSummary.tldr}
              </p>
            </div>
          </div>

          {/* Key Conclusions & Decisions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-forest">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              <h3 className="font-bold text-sm text-ink-primary">
                Key Conclusions & Decisions
              </h3>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-ink-secondary pl-5 list-disc">
              {activeSummary.keyConclusions.map((conc, idx) => (
                <li key={idx} className="leading-relaxed">
                  {conc}
                </li>
              ))}
            </ul>
          </div>

          {/* Open Questions */}
          {activeSummary.openQuestions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-surface-border">
              <div className="flex items-center gap-2 text-amber-700">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-ink-primary">
                  Open Questions & Blockers
                </h3>
              </div>

              <div className="space-y-2">
                {activeSummary.openQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-xs sm:text-sm text-amber-900"
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Action Items Table */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <div className="flex items-center gap-2 text-forest">
              <ListTodo className="w-4 h-4 text-forest" />
              <h3 className="font-bold text-sm text-ink-primary">
                Extracted Action Items
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-surface-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-offwhite border-b border-surface-border text-ink-secondary font-bold">
                  <tr>
                    <th className="p-3">Action Item</th>
                    <th className="p-3">Assignee</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {activeSummary.actionItems.map((act, idx) => (
                    <tr key={idx} className="hover:bg-surface-offwhite/50">
                      <td className="p-3 font-medium text-ink-primary">{act.task}</td>
                      <td className="p-3 text-ink-secondary flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-ink-muted" />
                        <span>{act.assignee}</span>
                      </td>
                      <td className="p-3 text-ink-muted font-mono">{act.deadline}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            act.done
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {act.done ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
