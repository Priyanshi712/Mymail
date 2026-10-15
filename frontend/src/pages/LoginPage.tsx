import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "../components/ui/BrandLogo";
import { InputField } from "../components/ui/InputField";
import { PillButton } from "../components/ui/PillButton";
import { AuthCard } from "../components/ui/AuthCard";
import { AlertBanner } from "../components/ui/AlertBanner";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillDemoAccount = () => {
    setEmail("demo@mymail.ai");
    setPassword("Password123");
    setErrors({});
    setGeneralError(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
        remember_me: rememberMe,
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred during login.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-mesh flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <BrandLogo size="md" />
        <Link
          to="/signup"
          className="text-xs font-bold text-forest hover:underline py-1 px-3 rounded-lg hover:bg-forest/5"
        >
          Create Account
        </Link>
      </header>

      {/* Main Centered Composition (No large illustration) */}
      <main className="w-full flex flex-col items-center justify-center my-8">
        <AuthCard maxWidth="md">
          <div className="mb-6 text-left">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
                Welcome back
              </h1>
              {/* Demo Auto-fill Pill */}
              <button
                type="button"
                onClick={fillDemoAccount}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-soft/60 hover:bg-lime-soft text-forest text-xs font-bold transition-colors cursor-pointer border border-lime-action/40"
                title="Fill with seeded demo credentials"
              >
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                Fill Demo
              </button>
            </div>
            <p className="text-sm text-ink-secondary">
              Sign in to manage your AI email workflow.
            </p>
          </div>

          {generalError && (
            <AlertBanner
              type="error"
              message={generalError}
              className="mb-5"
              onClose={() => setGeneralError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-ink-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-surface-border text-forest focus:ring-lime-action accent-[#173D2B]"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-bold text-forest hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-3">
              <PillButton
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
              >
                Log In
              </PillButton>
            </div>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <span className="relative bg-white px-3 text-xs text-ink-muted uppercase tracking-wider font-semibold">
              Or continue with
            </span>
          </div>

          {/* Disabled Social Button */}
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-full border border-dashed border-surface-border bg-surface-offwhite/50 text-ink-muted text-xs font-semibold cursor-not-allowed opacity-75"
            title="Gmail OAuth connection will be activated in Milestone D"
          >
            <svg className="w-4 h-4 grayscale opacity-60" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Single Sign-On (Milestone D)</span>
          </button>

          <div className="mt-6 text-center text-xs text-ink-secondary">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-bold text-forest hover:underline">
              Create an account
            </Link>
          </div>
        </AuthCard>
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-ink-muted">
        © 2026 MyMail Inc. • Secure Human-in-the-Loop Email Architecture
      </footer>
    </div>
  );
};
