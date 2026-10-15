import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { api } from "../services/api";
import { BrandLogo } from "../components/ui/BrandLogo";
import { InputField } from "../components/ui/InputField";
import { PillButton } from "../components/ui/PillButton";
import { AuthCard } from "../components/ui/AuthCard";
import { AlertBanner } from "../components/ui/AlertBanner";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDevToken(null);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword({ email: email.trim().toLowerCase() });
      setSuccessMsg(res.message);
      // Extract dev token if present in dev mode
      if (res.message.includes("Dev Token: ")) {
        const token = res.message.split("Dev Token: ")[1].replace(")", "").trim();
        setDevToken(token);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to request password reset.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-mesh flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <BrandLogo size="md" />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
      </header>

      <main className="w-full flex flex-col items-center justify-center my-8">
        <AuthCard maxWidth="md">
          <div className="mb-6 text-left">
            <div className="w-12 h-12 rounded-2xl bg-lime-soft/70 border border-lime-action/40 flex items-center justify-center mb-4 text-forest">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-ink-primary tracking-tight">
              Reset your password
            </h1>
            <p className="text-sm text-ink-secondary mt-1">
              Enter your email address and we'll send you a secure verification link to reset your password.
            </p>
          </div>

          {error && (
            <AlertBanner
              type="error"
              message={error}
              className="mb-5"
              onClose={() => setError(null)}
            />
          )}

          {successMsg && (
            <div className="space-y-4 mb-6">
              <AlertBanner type="success" message={successMsg} />
              {devToken && (
                <div className="p-4 rounded-2xl bg-surface-offwhite border border-surface-border text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-forest mb-1">
                    Development Quick-Test Token:
                  </p>
                  <code className="text-xs bg-white px-2 py-1 rounded-lg border border-surface-border block break-all text-ink-primary select-all">
                    {devToken}
                  </code>
                  <div className="mt-3">
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="inline-block text-xs font-bold text-forest underline hover:text-forest-dark"
                    >
                      Click here to reset password directly with this token →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {!devToken && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Registered Email"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <div className="pt-2">
                <PillButton
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  Send Reset Link
                </PillButton>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-ink-secondary">
            Remember your credentials?{" "}
            <Link to="/login" className="font-bold text-forest hover:underline">
              Return to log in
            </Link>
          </div>
        </AuthCard>
      </main>

      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-ink-muted">
        © 2026 MyMail Inc. • Secure Password Recovery Architecture
      </footer>
    </div>
  );
};
