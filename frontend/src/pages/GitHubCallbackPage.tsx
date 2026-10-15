import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "../components/ui/BrandLogo";
import { AuthCard } from "../components/ui/AuthCard";
import { PillButton } from "../components/ui/PillButton";

export const GitHubCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthSuccess } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setErrorMessage("Missing authorization code or state from GitHub callback.");
      setIsProcessing(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const authData = await api.githubCallback({ code, state });
        handleOAuthSuccess(authData);
        navigate("/dashboard", { replace: true });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to authenticate with GitHub. Please try again.");
        }
        setIsProcessing(false);
      }
    };

    exchangeCode();
  }, [searchParams, handleOAuthSuccess, navigate]);

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
          {isProcessing ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-lime-soft border-t-forest animate-spin mx-auto" />
              <h2 className="text-xl font-extrabold text-ink-primary">
                Connecting GitHub Account
              </h2>
              <p className="text-xs text-ink-secondary max-w-xs mx-auto">
                Verifying CSRF token and issuing your secure MyMail session...
              </p>
            </div>
          ) : (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto text-red-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-ink-primary">
                  Authentication Failed
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
                  onClick={() => navigate("/login")}
                >
                  Return to Login
                </PillButton>
              </div>
            </div>
          )}
        </AuthCard>
      </main>

      <footer className="max-w-md w-full mx-auto text-center py-4 text-xs text-ink-muted">
        © 2026 MyMail Inc. • Secure OAuth 2.0 Integration
      </footer>
    </div>
  );
};
