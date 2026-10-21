import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import { useAppShell } from "../../context/AppShellContext";
import { PillButton } from "../ui/PillButton";

type ToneOption = "Professional" | "Concise" | "Friendly" | "Formal" | "Urgent";

export const ComposeModal: React.FC = () => {
  const { isComposeOpen, closeCompose, composeData } = useAppShell();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneOption>("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (isComposeOpen) {
      setTo(composeData?.to || "");
      setSubject(composeData?.subject || "");
      setBody(composeData?.body || "");
      setAiPrompt("");
      setStep("edit");
      setIsSent(false);
    }
  }, [isComposeOpen, composeData]);

  if (!isComposeOpen) return null;

  const tones: ToneOption[] = ["Professional", "Concise", "Friendly", "Formal", "Urgent"];

  const handleGenerateDraft = () => {
    if (!aiPrompt && !subject) return;
    setIsGenerating(true);

    setTimeout(() => {
      let draftText = "";
      if (selectedTone === "Concise") {
        draftText = `Hi ${to ? to.split("@")[0] : "there"},\n\nThanks for your note. Regarding "${subject || aiPrompt}": all details look solid on our end. Let's proceed as discussed.\n\nBest,\nYour Name`;
      } else if (selectedTone === "Friendly") {
        draftText = `Hey ${to ? to.split("@")[0] : "there"}!\n\nHope your week is going great. I caught your message regarding "${subject || aiPrompt}". Everything looks fantastic—really excited to push this forward together. Let me know if you need any additional assets!\n\nWarmly,\nYour Name`;
      } else if (selectedTone === "Formal") {
        draftText = `Dear ${to ? to.split("@")[0] : "Colleague"},\n\nI am writing to formally address your correspondence concerning "${subject || aiPrompt}". We have conducted a preliminary review and confirm alignment with the designated parameters. Please find our complete concurrence attached.\n\nSincerely,\nYour Name`;
      } else if (selectedTone === "Urgent") {
        draftText = `URGENT — Action Required\n\nHi ${to ? to.split("@")[0] : "Team"},\n\nRegarding "${subject || aiPrompt}": we need your expedited confirmation by end of day today so we can finalize the deliverables without delay. Please verify immediately.\n\nThank you,\nYour Name`;
      } else {
        draftText = `Hi ${to ? to.split("@")[0] : "there"},\n\nThank you for reaching out regarding "${subject || aiPrompt}". I have reviewed the requirements and believe this provides a great path forward. We are ready to proceed with the next milestones.\n\nPlease let me know if you have any questions or require revisions before we lock this in.\n\nBest regards,\nYour Name`;
      }

      setBody(draftText);
      setIsGenerating(false);
    }, 800);
  };

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      closeCompose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-dark/50 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSent) closeCompose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-surface-border overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-surface-offwhite border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest text-lime-action flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ink-primary">
                {step === "confirm" ? "Confirm & Authorize Dispatch" : "New Email • AI Copilot Ready"}
              </h3>
              <p className="text-[11px] text-ink-muted">Human-in-the-Loop Safe Send Enforced</p>
            </div>
          </div>

          <button
            onClick={closeCompose}
            className="w-8 h-8 rounded-xl bg-white border border-surface-border flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            aria-label="Close composer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSent ? (
          /* Success Screen */
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-lime-soft border-2 border-lime-action flex items-center justify-center text-forest animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-forest" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-ink-primary">Message Authorized & Dispatched</h3>
              <p className="text-xs text-ink-secondary">
                Sent to <span className="font-semibold text-forest">{to}</span> via Gmail API.
              </p>
            </div>
          </div>
        ) : step === "confirm" ? (
          /* Step 2: Explicit Confirmation */
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Human-in-the-Loop Send Verification</p>
                <p className="text-amber-800">
                  Please inspect the recipient address, subject, and finalized message body. Once dispatched, this action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-surface-offwhite rounded-2xl p-5 border border-surface-border space-y-3 text-xs">
              <div className="flex border-b border-surface-border/60 pb-2">
                <span className="w-20 font-bold text-ink-secondary">To:</span>
                <span className="font-mono text-ink-primary font-bold">{to || "(No recipient specified)"}</span>
              </div>
              <div className="flex border-b border-surface-border/60 pb-2">
                <span className="w-20 font-bold text-ink-secondary">Subject:</span>
                <span className="font-bold text-ink-primary">{subject || "(No subject)"}</span>
              </div>
              <div>
                <span className="block font-bold text-ink-secondary mb-2">Message Body Preview:</span>
                <div className="p-3 bg-white rounded-xl border border-surface-border font-sans whitespace-pre-wrap text-ink-primary max-h-48 overflow-y-auto leading-relaxed">
                  {body}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <PillButton
                variant="secondary"
                size="md"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={() => setStep("edit")}
              >
                Back to Editing
              </PillButton>

              <PillButton
                variant="primary"
                size="md"
                icon={<Send className="w-4 h-4" />}
                onClick={handleSend}
                disabled={!to || !body}
              >
                Approve & Send Now
              </PillButton>
            </div>
          </div>
        ) : (
          /* Step 1: Interactive Draft Editor with AI Copilot */
          <div className="p-6 space-y-4 overflow-y-auto">
            {/* AI Prompt & Tone Assistant */}
            <div className="bg-gradient-to-r from-forest/5 via-lime-soft/15 to-transparent rounded-2xl p-4 border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-forest">
                  <Wand2 className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-tight">AI Drafting Copilot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-ink-muted uppercase">Tone:</span>
                  <div className="flex items-center gap-1">
                    {tones.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTone(t)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                          selectedTone === t
                            ? "bg-forest text-lime-action shadow-2xs"
                            : "bg-white text-ink-secondary border border-surface-border hover:bg-surface-offwhite"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Tell AI what to write (e.g. 'Politely confirm meeting for Friday at 3 PM')..."
                  className="flex-1 bg-white border border-surface-border rounded-xl px-3.5 py-2 text-xs text-ink-primary focus:outline-none focus:border-forest"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGenerateDraft();
                    }
                  }}
                />
                <PillButton
                  variant="dark"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5 text-lime-action" />}
                  isLoading={isGenerating}
                  onClick={handleGenerateDraft}
                >
                  Generate
                </PillButton>
              </div>
            </div>

            {/* Email Form Fields */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center border-b border-surface-border pb-2">
                <label className="w-16 font-bold text-ink-secondary">To:</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 bg-transparent text-xs font-medium text-ink-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center border-b border-surface-border pb-2">
                <label className="w-16 font-bold text-ink-secondary">Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief and descriptive subject..."
                  className="flex-1 bg-transparent text-xs font-medium text-ink-primary focus:outline-none"
                />
              </div>

              {/* Message Body Textarea */}
              <div className="pt-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Draft your message here, or use the AI Copilot above to generate a tailored draft..."
                  rows={9}
                  className="w-full bg-surface-offwhite/50 border border-surface-border rounded-2xl p-4 text-xs font-sans leading-relaxed text-ink-primary focus:outline-none focus:border-forest focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-border">
              <div className="flex items-center gap-2 text-ink-muted text-[11px]">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Requires human approval before sending</span>
              </div>

              <div className="flex items-center gap-3">
                <PillButton
                  variant="secondary"
                  size="sm"
                  onClick={closeCompose}
                >
                  Discard
                </PillButton>

                <PillButton
                  variant="primary"
                  size="sm"
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={() => setStep("confirm")}
                  disabled={!to.trim() || !body.trim()}
                >
                  Review & Send
                </PillButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
