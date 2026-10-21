import React, { useState } from "react";
import {
  FileEdit,
  Sparkles,
  Trash2,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";

interface DraftItem {
  id: string;
  to: string;
  subject: string;
  body: string;
  tone: string;
  generatedAt: string;
}

export const DraftsPage: React.FC = () => {
  const { openCompose } = useAppShell();

  const [drafts, setDrafts] = useState<DraftItem[]>([
    {
      id: "d1",
      to: "sarah.chen@acme.corp",
      subject: "Re: Q4 Cloud Infrastructure Budget Sign-off Needed",
      tone: "Professional",
      generatedAt: "10 mins ago",
      body: "Hi Sarah,\n\nThank you for the detailed breakdown. We have evaluated the Q4 compute cluster requirements and approved the $4,200/mo allocation for the 4 additional GPU nodes. Please proceed with the purchase order.\n\nBest regards,\nPriyanshi",
    },
    {
      id: "d2",
      to: "marcus@vancecap.io",
      subject: "Re: Partnership Agreement — Revised Term Sheet",
      tone: "Formal",
      generatedAt: "1 hour ago",
      body: "Dear Marcus,\n\nWe have reviewed the amended IP indemnification clauses in Section 4.3. The revisions satisfy our legal requirements. We are ready to execute the agreement upon receipt of the final DocuSign envelope.\n\nSincerely,\nPriyanshi",
    },
  ]);

  const handleDelete = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/15 text-forest text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            <span>AI Draft Staging Queue (Milestone I)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            Pending AI Drafts
          </h1>

          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            AI-generated reply drafts awaiting your explicit human review. No draft is dispatched until you authorize the final wording.
          </p>
        </div>

        <div className="shrink-0">
          <PillButton
            variant="primary"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => openCompose()}
          >
            Create New Draft
          </PillButton>
        </div>
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-soft-card space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-lime-soft flex items-center justify-center text-forest mx-auto">
              <CheckCircle2 className="w-7 h-7 text-forest" />
            </div>
            <h3 className="font-extrabold text-base text-ink-primary">No pending drafts</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              All AI-generated replies have been reviewed and dispatched.
            </p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card hover:border-lime-action/80 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-forest text-lime-action font-extrabold flex items-center justify-center text-xs shadow-xs">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink-secondary">
                      Recipient: <span className="text-ink-primary font-mono">{draft.to}</span>
                    </h3>
                    <p className="text-xs text-ink-muted">Prepared {draft.generatedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-lime-light text-forest border border-lime-action/40">
                    Tone: {draft.tone}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-offwhite text-ink-secondary border border-surface-border">
                    Pending Approval
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-ink-primary">{draft.subject}</h4>
                <div className="p-4 bg-surface-offwhite/50 border border-surface-border rounded-2xl text-xs font-sans whitespace-pre-wrap text-ink-primary leading-relaxed">
                  {draft.body}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleDelete(draft.id)}
                  className="text-xs font-bold text-ink-muted hover:text-rose-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard Draft</span>
                </button>

                <div className="flex items-center gap-3">
                  <PillButton
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-3.5 h-3.5" />}
                    onClick={() =>
                      openCompose({
                        to: draft.to,
                        subject: draft.subject,
                        body: draft.body,
                      })
                    }
                  >
                    Review & Authorize
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
