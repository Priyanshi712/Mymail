import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AlertBannerProps {
  type?: "error" | "success" | "info";
  message: string;
  className?: string;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = "error",
  message,
  className = "",
  onClose,
}) => {
  if (!message) return null;

  const styles = {
    error: {
      container: "bg-red-50/90 text-red-800 border-red-200/80",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    success: {
      container: "bg-lime-light text-forest border-lime-action/40",
      icon: <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />,
    },
    info: {
      container: "bg-surface-hover text-ink-primary border-surface-border",
      icon: <Info className="w-5 h-5 text-forest shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border text-sm font-medium ${current.container} ${className}`}
      role="alert"
    >
      {current.icon}
      <div className="flex-1 leading-snug">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs font-semibold uppercase hover:opacity-75 focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
};
