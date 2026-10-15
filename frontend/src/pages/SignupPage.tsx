import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "../components/ui/BrandLogo";
import { InputField } from "../components/ui/InputField";
import { PillButton } from "../components/ui/PillButton";
import { AuthCard } from "../components/ui/AuthCard";
import { AlertBanner } from "../components/ui/AlertBanner";
import { GitHubOAuthButton } from "../components/ui/GitHubOAuthButton";
import signupHeroImg from "../assets/signup-hero.jpg";

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name (minimum 2 characters)";
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please provide a valid email address";
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = "Password must contain at least one letter and one number";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy";
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
      await signup({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred during signup.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-mesh flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <BrandLogo size="md" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-secondary hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="text-forest font-bold hover:underline py-1.5 px-3 rounded-xl hover:bg-forest/5 transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-6">
        {/* Left Hero Section (with Custom 3D Illustration) */}
        <section className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft/70 border border-lime-action text-forest text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span>
            Production Email Copilot
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink-primary tracking-tight leading-tight">
            Take control of your inbox with <span className="text-forest">intelligent clarity</span>.
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary max-w-xl">
            Summarize deep threads, discover action items, and generate context-rich replies with human approval by default.
          </p>

          {/* 3D Illustration Showcase */}
          <div className="relative w-full max-w-md lg:max-w-lg aspect-[3/4] max-h-[440px] rounded-3xl overflow-hidden shadow-soft-card border border-surface-border group">
            <img
              src={signupHeroImg}
              alt="Intelligent Email AI Agent 3D Workspace Illustration"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left">
              <div className="flex items-center gap-2 text-lime-action text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                Human-in-the-Loop Safe
              </div>
              <p className="text-sm font-medium text-slate-100">
                Zero automated email sending without explicit user approval.
              </p>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg pt-2 text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 border border-surface-border">
              <CheckCircle className="w-4 h-4 text-forest shrink-0" />
              <span className="text-xs font-semibold text-ink-primary">Accurate Action Items</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 border border-surface-border">
              <CheckCircle className="w-4 h-4 text-forest shrink-0" />
              <span className="text-xs font-semibold text-ink-primary">Persistent Reminders</span>
            </div>
          </div>
        </section>

        {/* Right Authentication Card */}
        <section className="lg:col-span-6 flex justify-center lg:justify-end">
          <AuthCard maxWidth="lg">
            <div className="mb-6 text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-ink-secondary mt-1">
                Get started with your intelligent portfolio email agent today.
              </p>
            </div>

            {generalError && (
              <AlertBanner
                type="error"
                message={generalError}
                className="mb-6"
                onClose={() => setGeneralError(null)}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                placeholder="Sarah Connor"
                icon={<User className="w-4 h-4" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                autoComplete="name"
                required
              />

              <InputField
                label="Email Address"
                type="email"
                placeholder="sarah@example.com"
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
                placeholder="At least 8 characters with letters & numbers"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="new-password"
                required
              />

              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                icon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none text-left">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-md border-surface-border text-forest focus:ring-lime-action focus:ring-offset-0 cursor-pointer accent-[#173D2B]"
                  />
                  <span className="text-xs text-ink-secondary leading-relaxed">
                    I agree to the{" "}
                    <a href="#terms" className="font-semibold text-forest underline hover:text-forest-dark">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#privacy" className="font-semibold text-forest underline hover:text-forest-dark">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <PillButton
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  Create Account
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
            <GitHubOAuthButton label="Sign up with GitHub" />

            <div className="mt-6 text-center text-xs text-ink-secondary">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-forest hover:underline">
                Log in
              </Link>
            </div>
          </AuthCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center py-4 text-xs text-ink-muted">
        © 2026 MyMail Inc. Portfolio-grade AI Email Agent • All rights reserved.
      </footer>
    </div>
  );
};
