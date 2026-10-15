import React from "react";
import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  to?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = "md", to = "/", className = "" }) => {
  const iconSizes = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-10 h-10 rounded-2xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <div
        className={`${iconSizes[size]} bg-forest flex items-center justify-center shadow-md shadow-forest/10 transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-5 h-5 text-lime-action"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="3" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight text-ink-primary ${textSizes[size]}`}>
          My<span className="text-forest">Mail</span>
        </span>
        {size !== "sm" && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-forest-muted -mt-1">
            AI Inbox Copilot
          </span>
        )}
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};
