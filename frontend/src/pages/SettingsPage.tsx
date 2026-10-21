import React, { useState } from "react";
import {
  Mail,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { mailboxConnected, setMailboxConnected, lastSyncedTime, triggerSync, isSyncing } = useAppShell();

  const [defaultTone, setDefaultTone] = useState<string>("Professional");
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);
  const [customSignature, setCustomSignature] = useState<string>(
    "Best regards,\nPriyanshi | Product Engineer"
  );
  const [safeSendStrict, setSafeSendStrict] = useState<boolean>(true);
  const [autoDetectReplies, setAutoDetectReplies] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/15 text-forest text-xs font-bold">
            <Sliders className="w-3.5 h-3.5 text-forest" />
            <span>Preferences & Safety Controls (Milestone M)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            Settings & Copilot Configuration
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Customize AI drafting tones, manage email accounts, and configure safety policies.
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-soft border border-lime-action text-forest text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Connected Email Provider Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-lime-action flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">Connected Email Provider</h2>
              <p className="text-xs text-ink-muted">OAuth 2.0 Integration with Google Gmail</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-offwhite border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-surface-border flex items-center justify-center text-forest font-bold text-sm">
                G
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink-primary">
                    {mailboxConnected ? "Google Gmail (Active)" : "Google Gmail (Disconnected)"}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      mailboxConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                    }`}
                  />
                </div>
                <p className="text-xs text-ink-muted">
                  {mailboxConnected
                    ? `Authenticated as ${user?.email || "user@gmail.com"} • Last synced: ${lastSyncedTime}`
                    : "No mailbox currently linked"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mailboxConnected ? (
                <>
                  <button
                    type="button"
                    onClick={triggerSync}
                    disabled={isSyncing}
                    className="px-3.5 py-2 rounded-full bg-white border border-surface-border text-xs font-bold text-ink-primary hover:bg-surface-hover transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>Sync Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMailboxConnected(false)}
                    className="px-3.5 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setMailboxConnected(true)}
                  className="px-4 py-2 rounded-full bg-forest text-lime-action hover:bg-forest-light text-xs font-bold transition-colors cursor-pointer"
                >
                  Connect Gmail Account
                </button>
              )}
            </div>
          </div>
        </section>

        {/* AI Drafting Tone & Customization */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-lime-action flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">AI Tone & Reply Behavior</h2>
              <p className="text-xs text-ink-muted">Configure how the copilot writes draft suggestions</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-ink-primary mb-2">
                Default Draft Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Professional", "Concise", "Friendly", "Formal"].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setDefaultTone(tone)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      defaultTone === tone
                        ? "bg-forest text-lime-action border-forest shadow-xs"
                        : "bg-surface-offwhite text-ink-secondary border-surface-border hover:bg-surface-hover"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-ink-primary">
                  Custom Email Signature
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="w-4 h-4 accent-forest rounded"
                  />
                  <span>Append to AI drafts</span>
                </label>
              </div>
              <textarea
                value={customSignature}
                onChange={(e) => setCustomSignature(e.target.value)}
                rows={3}
                disabled={!includeSignature}
                className="w-full bg-surface-offwhite/50 border border-surface-border rounded-2xl p-3.5 text-xs text-ink-primary font-sans focus:outline-none focus:border-forest disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        {/* Safety & Security Policy */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-lime-action flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">Safety & Security Isolation</h2>
              <p className="text-xs text-ink-muted">Guardrails for AI actions and OAuth credential safety</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-surface-offwhite border border-surface-border cursor-pointer">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-ink-primary block">
                  Mandatory Two-Step Send Approval
                </span>
                <span className="text-[11px] text-ink-muted block">
                  Always require explicit manual review before any drafted email can be dispatched.
                </span>
              </div>
              <input
                type="checkbox"
                checked={safeSendStrict}
                onChange={(e) => setSafeSendStrict(e.target.checked)}
                className="w-5 h-5 accent-forest rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-surface-offwhite border border-surface-border cursor-pointer">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-ink-primary block">
                  Automatic Needs-Reply Urgency Detection
                </span>
                <span className="text-[11px] text-ink-muted block">
                  Heuristic analysis scans incoming emails for action items and flags urgent inquiries.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoDetectReplies}
                onChange={(e) => setAutoDetectReplies(e.target.checked)}
                className="w-5 h-5 accent-forest rounded"
              />
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <PillButton variant="primary" size="md" type="submit">
            Save Preferences
          </PillButton>
        </div>
      </form>
    </div>
  );
};
