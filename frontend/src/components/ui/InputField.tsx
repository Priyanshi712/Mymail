import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, icon, type = "text", id, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    const effectiveType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full text-left">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-forest-muted mb-1.5"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 pointer-events-none text-ink-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            className={`w-full bg-white text-ink-primary text-sm font-medium rounded-2xl border transition-all duration-200 outline-none placeholder:text-ink-muted/70 ${
              icon ? "pl-11" : "pl-4"
            } ${isPasswordType ? "pr-12" : "pr-4"} py-3.5 ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-surface-border focus:border-forest focus:ring-4 focus:ring-lime-action/25 hover:border-forest-muted/40"
            } ${className}`}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-1.5 text-ink-muted hover:text-forest transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>•</span> {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = "InputField";
