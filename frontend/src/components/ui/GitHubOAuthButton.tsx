import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../services/api";

interface GitHubOAuthButtonProps {
  label?: string;
  className?: string;
}

export const GitHubOAuthButton: React.FC<GitHubOAuthButtonProps> = ({
  label = "Continue with GitHub",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.getGitHubAuthUrl();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("Unable to obtain GitHub authorization link");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to initialize GitHub authentication.");
      }
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGitHubLogin}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-full border border-forest/20 bg-forest text-white hover:bg-forest-dark hover:shadow-md transition-all duration-200 active:scale-[0.98] font-bold text-xs sm:text-sm tracking-wide cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-lime-action" />
        ) : (
          <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        )}
        <span>{isLoading ? "Connecting to GitHub..." : label}</span>
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium text-center">{error}</p>
      )}
    </div>
  );
};
