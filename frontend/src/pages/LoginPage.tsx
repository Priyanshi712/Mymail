import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "../components/ui/BrandLogo";
import { InputField } from "../components/ui/InputField";
import { PillButton } from "../components/ui/PillButton";
import { AuthCard } from "../components/ui/AuthCard";
import { AlertBanner } from "../components/ui/AlertBanner";
import { GitHubOAuthButton } from "../components/ui/GitHubOAuthButton";

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

          {/* Active GitHub OAuth Button */}
          <GitHubOAuthButton label="Sign in with GitHub" />

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
