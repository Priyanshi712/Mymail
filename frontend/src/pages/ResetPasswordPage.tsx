import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, KeyRound } from "lucide-react";
import { api } from "../services/api";
import { BrandLogo } from "../components/ui/BrandLogo";
import { InputField } from "../components/ui/InputField";
import { PillButton } from "../components/ui/PillButton";
import { AuthCard } from "../components/ui/AuthCard";
import { AlertBanner } from "../components/ui/AlertBanner";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!token.trim()) {
      newErrors.token = "Verification token is required";
    }
    if (!newPassword || newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least one letter and one number";
    }
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
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
      await api.resetPassword({
        token: token.trim(),
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("Failed to reset password. Please check your token.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-mesh flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <BrandLogo size="md" />
        <Link to="/login" className="text-xs font-bold text-forest hover:underline">
          Return to log in
        </Link>
      </header>

      <main className="w-full flex flex-col items-center justify-center my-8">
        <AuthCard maxWidth="md">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-lime-soft flex items-center justify-center mx-auto text-forest shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-ink-primary">
                Password Reset Complete
              </h2>
              <p className="text-sm text-ink-secondary max-w-sm mx-auto">
                Your password has been securely updated. You can now log into your MyMail account with your new credentials.
              </p>
              <div className="pt-4">
                <PillButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate("/login")}
                >
                  Log In Now
                </PillButton>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-left">
                <div className="w-12 h-12 rounded-2xl bg-lime-soft/70 border border-lime-action/40 flex items-center justify-center mb-4 text-forest">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-ink-primary tracking-tight">
                  Set new password
                </h1>
                <p className="text-sm text-ink-secondary mt-1">
                  Create a new secure password for your account.
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
                  label="Reset Token"
                  type="text"
                  placeholder="Paste your reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  error={errors.token}
                  required
                />

                <InputField
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 chars with letter & number"
                  icon={<Lock className="w-4 h-4" />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                  autoComplete="new-password"
                  required
                />

                <InputField
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter your new password"
                  icon={<Lock className="w-4 h-4" />}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  error={errors.confirmNewPassword}
                  autoComplete="new-password"
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
                    Update Password
                  </PillButton>
                </div>
              </form>
            </>
          )}
        </AuthCard>
      </main>

      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-ink-muted">
        © 2026 MyMail Inc. • Password Reset Verification
      </footer>
    </div>
  );
};
