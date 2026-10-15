import React from "react";
import { LogOut, User, ShieldCheck, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "../components/ui/BrandLogo";
import { PillButton } from "../components/ui/PillButton";

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-offwhite flex flex-col justify-between">
      {/* Authenticated Top Navbar */}
      <header className="bg-white border-b border-surface-border px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-soft/70 border border-lime-action text-forest text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span>
              Session Verified
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-ink-primary">{user?.full_name}</span>
              <span className="text-xs text-ink-secondary">{user?.email}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-forest text-lime-action font-extrabold flex items-center justify-center text-sm shadow-sm">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <PillButton
              variant="secondary"
              size="sm"
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={logout}
            >
              Log out
            </PillButton>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-8">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-forest to-forest-light rounded-3xl p-8 sm:p-10 text-white shadow-soft-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-lime-action text-xs font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Milestone 1 Verified
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to MyMail, {user?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-slate-200 text-sm sm:text-base max-w-2xl">
              You are signed in securely through your authenticated session. Authentication, protected route guards, and the Messimo design system are active.
            </p>
          </div>
        </section>

        {/* Milestone 1 Information Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lime-soft flex items-center justify-center text-forest">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink-primary text-base">User Identity</h3>
                <p className="text-xs text-ink-muted">Authenticated Subject</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs border-t border-surface-border">
              <div className="flex justify-between">
                <span className="text-ink-secondary">User ID</span>
                <span className="font-mono text-ink-primary font-medium truncate max-w-[150px]">
                  {user?.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Email</span>
                <span className="font-semibold text-ink-primary">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Full Name</span>
                <span className="font-semibold text-ink-primary">{user?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Member Since</span>
                <span className="text-ink-primary">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Today"}
                </span>
              </div>
            </div>
          </div>

          {/* Security Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest/10 flex items-center justify-center text-forest">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink-primary text-base">Security Isolation</h3>
                <p className="text-xs text-ink-muted">Backend & Client Guard</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs border-t border-surface-border">
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">JWT Token Bearer</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Password Hashing</span>
                <span className="font-mono text-ink-primary">Bcrypt Salted</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Protected Routes</span>
                <span className="text-emerald-700 font-semibold">Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">Human Send Lock</span>
                <span className="text-forest font-semibold">Default ON</span>
              </div>
            </div>
          </div>

          {/* Next Feature Card */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-soft-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lime-soft flex items-center justify-center text-forest">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink-primary text-base">Next Feature</h3>
                <p className="text-xs text-ink-muted">Milestone B: Shell & Navigation</p>
              </div>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed pt-2 border-t border-surface-border">
              Milestone A (Authentication) is complete. The next approved step will construct the full application shell: Sidebar navigation (Overview, Inbox, Needs Reply, AI Summaries, Drafts, Follow-ups, Settings) and responsive layouts.
            </p>
          </div>
        </section>

        {/* Feature Roadmap Checklist */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-card space-y-4">
          <h2 className="text-lg font-bold text-ink-primary">Project Roadmap & Milestone Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-lime-light/60 border border-lime-action/40 text-forest font-semibold">
              <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
              <span>A. Authentication & Design System (Done)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-offwhite border border-surface-border text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>B. Application Shell & Navigation (Next)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-offwhite border border-surface-border text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>C. Dashboard Overview</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-offwhite border border-surface-border text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>D. Gmail Provider Connection</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-offwhite border border-surface-border text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>E. Inbox & Thread Viewer</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-offwhite border border-surface-border text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>F. AI Summaries & Actions</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-border px-6 py-4 text-center text-xs text-ink-muted">
        © 2026 MyMail • Portfolio-grade AI Email Agent • All rights reserved.
      </footer>
    </div>
  );
};
