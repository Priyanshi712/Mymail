import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  className = "",
  maxWidth = "md",
}) => {
  const maxWStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div
      className={`w-full ${maxWStyles[maxWidth]} bg-surface-card rounded-3xl sm:rounded-4xl p-8 sm:p-11 shadow-soft-card border border-surface-border/80 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};
