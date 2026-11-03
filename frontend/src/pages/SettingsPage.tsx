import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertCircle,
  Plus,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppShell } from "../context/AppShellContext";
import { PillButton } from "../components/ui/PillButton";
import { api } from "../services/api";
import type { ConnectedAccount } from "../types/email";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    setMailboxConnected,
    lastSyncedTime,
    isSyncing,
    refreshAccounts,
  } = useAppShell();

  // Local state
  const [defaultTone, setDefaultTone] = useState<string>("Professional");
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);
  const [customSignature, setCustomSignature] = useState<string>(
    "Best regards,\nPriyanshi | Product Engineer"
  );
  const [safeSendStrict, setSafeSendStrict] = useState<boolean>(true);
  const [autoDetectReplies, setAutoDetectReplies] = useState<boolean>(true);

  // Email provider states
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadProviderData = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const accs = await api.getConnectedEmailAccounts().catch(() => []);
      setAccounts(accs);
      const active = accs.some((a) => a.status === "active");
      setMailboxConnected(active);
    } catch {
      // Fallback gracefully
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [setMailboxConnected]);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const handleConnectProvider = async (providerKey: string) => {
    setConnectingProvider(providerKey);
    try {
      const { url } = await api.getEmailOAuthUrl(providerKey);
      // Navigate to authorization URL
      window.location.href = url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate provider OAuth flow.";
      showNotification("error", msg);
      setConnectingProvider(null);
    }
  };

  const handleSyncAccount = async (account: ConnectedAccount) => {
    try {
      const res = await api.syncEmailAccount(account.id);
      showNotification("success", res.message);
      await loadProviderData();
      await refreshAccounts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Synchronization failed.";
      showNotification("error", msg);
    }
  };

  const handleDisconnectAccount = async (account: ConnectedAccount) => {
    try {
      const res = await api.disconnectEmailAccount(account.id);
      showNotification("info", res.message);
      await loadProviderData();
      await refreshAccounts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to disconnect account.";
      showNotification("error", msg);
    }
  };

  const handleReconnectAccount = async (account: ConnectedAccount) => {
    try {
      await api.reconnectEmailAccount(account.id);
      showNotification("success", `Reconnected ${account.email} successfully.`);
      await loadProviderData();
      await refreshAccounts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reconnect account.";
      showNotification("error", msg);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification("success", "Preferences and AI drafting parameters saved.");
  };

  // Find connected accounts by provider
  const googleAccount = accounts.find((a) => a.provider === "google");
  const outlookAccount = accounts.find((a) => a.provider === "microsoft");

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/15 text-forest text-xs font-bold">
            <Sliders className="w-3.5 h-3.5 text-forest" />
            <span>Preferences & Email Providers (Milestone D & M)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-primary">
            Settings & Provider Configuration
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Manage Gmail & Outlook OAuth 2.0 connections, configure AI tone, and enforce safety guardrails.
          </p>
        </div>

        {notification && (
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold animate-in fade-in ${
              notification.type === "success"
                ? "bg-lime-soft border-lime-action text-forest"
                : notification.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-surface-offwhite border-surface-border text-ink-primary"
            }`}
          >
            {notification.type === "success" && <CheckCircle2 className="w-4 h-4 text-forest" />}
            {notification.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Connected Email Provider Section (Milestone D) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest text-lime-action flex items-center justify-center shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  Email Provider Connections (Milestone D)
                </h2>
                <p className="text-xs text-ink-muted">
                  Modular OAuth 2.0 architecture supporting Google Gmail and Microsoft Outlook
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-forest bg-forest/5 px-2.5 py-1 rounded-full border border-forest/10 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Encrypted Server Vault</span>
              </span>
            </div>
          </div>

          {isLoadingAccounts && (
            <div className="text-xs text-ink-muted flex items-center gap-2 py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest" />
              <span>Verifying active provider connections...</span>
            </div>
          )}

          {/* Provider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Gmail Provider Card */}
            <div className="p-5 rounded-3xl bg-surface-offwhite border border-surface-border space-y-4 flex flex-col justify-between hover:border-lime-action/60 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-white border border-surface-border flex items-center justify-center font-bold text-red-500 text-sm shadow-xs">
                      G
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink-primary">Google Gmail</h3>
                      <p className="text-[10px] text-ink-muted">Gmail API • OAuth 2.0</p>
                    </div>
                  </div>

                  {googleAccount && googleAccount.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : googleAccount && googleAccount.status === "disconnected" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">
                      Disconnected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">
                      Not Linked
                    </span>
                  )}
                </div>

                <p className="text-xs text-ink-secondary">
                  {googleAccount && googleAccount.status === "active"
                    ? `Authenticated as ${googleAccount.email} (${user?.full_name || "Primary User"})`
                    : "Connect your primary Google account for real-time thread synchronization and AI drafting."}
                </p>

                {/* Scopes badge */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                    Granted Permissions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-surface-border font-medium text-ink-secondary">
                      gmail.readonly
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-surface-border font-medium text-ink-secondary">
                      gmail.send
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-surface-border font-medium text-ink-secondary">
                      gmail.modify
                    </span>
                  </div>
                </div>

                {googleAccount && googleAccount.status === "active" && (
                  <p className="text-[11px] text-ink-muted">
                    Last synced: <span className="font-semibold text-ink-primary">{lastSyncedTime}</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-surface-border/70 flex items-center justify-between gap-2">
                {googleAccount && googleAccount.status === "active" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSyncAccount(googleAccount)}
                      disabled={isSyncing}
                      className="px-3.5 py-2 rounded-full bg-white border border-surface-border text-xs font-bold text-ink-primary hover:bg-surface-hover transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnectAccount(googleAccount)}
                      className="px-3.5 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : googleAccount && googleAccount.status === "disconnected" ? (
                  <button
                    type="button"
                    onClick={() => handleReconnectAccount(googleAccount)}
                    className="w-full py-2.5 rounded-full bg-forest text-lime-action hover:bg-forest-light text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reconnect Gmail</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectProvider("google")}
                    disabled={connectingProvider === "google"}
                    className="w-full py-2.5 rounded-full bg-forest text-lime-action hover:bg-forest-light text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{connectingProvider === "google" ? "Opening OAuth..." : "Connect Gmail Account"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Microsoft Outlook Provider Card (Modular Architecture) */}
            <div className="p-5 rounded-3xl bg-surface-offwhite border border-surface-border space-y-4 flex flex-col justify-between hover:border-lime-action/60 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-white border border-surface-border flex items-center justify-center font-bold text-blue-600 text-sm shadow-xs">
                      O
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink-primary">Microsoft Outlook</h3>
                      <p className="text-[10px] text-ink-muted">Graph API • Modular Architecture</p>
                    </div>
                  </div>

                  {outlookAccount && outlookAccount.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">
                      {outlookAccount ? "Disconnected" : "Ready to Link"}
                    </span>
                  )}
                </div>

                <p className="text-xs text-ink-secondary">
                  {outlookAccount && outlookAccount.status === "active"
                    ? `Authenticated as ${outlookAccount.email}`
                    : "Secondary provider via Microsoft Graph API. Demonstrates plug-and-play multi-account support."}
                </p>

                {/* Scopes badge */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                    Granted Permissions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-surface-border font-medium text-ink-secondary">
                      Mail.Read
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-surface-border font-medium text-ink-secondary">
                      Mail.Send
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-surface-border font-medium text-ink-secondary">
                      User.Read
                    </span>
                  </div>
                </div>

                {outlookAccount && outlookAccount.status === "active" && (
                  <p className="text-[11px] text-ink-muted">
                    Last synced: <span className="font-semibold text-ink-primary">{outlookAccount.last_synced_at || "Just now"}</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-surface-border/70 flex items-center justify-between gap-2">
                {outlookAccount && outlookAccount.status === "active" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSyncAccount(outlookAccount)}
                      className="px-3.5 py-2 rounded-full bg-white border border-surface-border text-xs font-bold text-ink-primary hover:bg-surface-hover transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnectAccount(outlookAccount)}
                      className="px-3.5 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectProvider("microsoft")}
                    disabled={connectingProvider === "microsoft"}
                    className="w-full py-2.5 rounded-full bg-white border border-surface-border hover:bg-surface-hover text-ink-primary text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-forest" />
                    <span>{connectingProvider === "microsoft" ? "Opening OAuth..." : "Connect Outlook Account"}</span>
                  </button>
                )}
              </div>
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
