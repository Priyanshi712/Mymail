import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import { useAppShell } from "../context/AppShellContext";
import { BrandLogo } from "../components/ui/BrandLogo";
import { AuthCard } from "../components/ui/AuthCard";
import { PillButton } from "../components/ui/PillButton";

export const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setMailboxConnected, triggerSync } = useAppShell();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  // Determine provider from path (e.g., /auth/callback/google vs /auth/callback/outlook)
  const isOutlook = location.pathname.includes("outlook") || searchParams.get("provider") === "microsoft";
  const provider = isOutlook ? "microsoft" : "google";
  const providerLabel = isOutlook ? "Microsoft Outlook" : "Google Gmail";

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setErrorMessage(`Missing authorization code or state token from ${providerLabel} callback.`);
      setIsProcessing(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const account = await api.emailOAuthCallback(provider, { code, state });
        setConnectedEmail(account.email);
        setMailboxConnected(true);
        triggerSync();
        setIsProcessing(false);

        // Redirect to settings page after brief success animation
        setTimeout(() => {
          navigate("/settings", { replace: true });
        }, 1800);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(`Failed to connect ${providerLabel} account. Please try again.`);
        }
        setIsProcessing(false);
      }
    };

    exchangeCode();
  }, [searchParams, provider, providerLabel, setMailboxConnected, triggerSync, navigate]);

  return (
    <div className="min-h-screen bg-subtle-mesh flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <BrandLogo size="md" />
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to settings
        </Link>
      </header>

      <main className="w-full flex flex-col items-center justify-center my-8">
        <AuthCard maxWidth="md">
          {isProcessing ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-lime-soft border-t-forest animate-spin mx-auto" />
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-ink-primary">
                  Connecting {providerLabel}
                </h2>
                <p className="text-xs text-ink-secondary max-w-xs mx-auto">
                  Exchanging secure OAuth 2.0 authorization code and storing credentials server-side...
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-forest bg-forest/5 py-1.5 px-3 rounded-full border border-forest/10 w-fit mx-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero token leakage • Server-side vault</span>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto text-red-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-ink-primary">
                  Connection Failed
                </h2>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {errorMessage}
                </p>
              </div>
              <div className="pt-2">
                <PillButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate("/settings")}
                >
                  Return to Settings
                </PillButton>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-lime-soft border border-lime-action flex items-center justify-center mx-auto text-forest shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-ink-primary">
                  Mailbox Connected!
                </h2>
                <p className="text-xs text-ink-secondary mt-1">
                  Successfully linked <strong className="text-forest font-bold">{connectedEmail}</strong>
                </p>
              </div>
              <div className="p-3 bg-surface-offwhite rounded-2xl border border-surface-border text-xs text-ink-muted flex items-center justify-center gap-2">
                <Mail className="w-3.5 h-3.5 text-forest" />
                <span>Redirecting to your dashboard...</span>
              </div>
            </div>
          )}
        </AuthCard>
      </main>

      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-ink-muted">
        © 2026 MyMail Inc. • Milestone D Email Provider OAuth 2.0 Integration
      </footer>
    </div>
  );
};

