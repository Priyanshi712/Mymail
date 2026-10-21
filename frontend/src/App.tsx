import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { GitHubCallbackPage } from "./pages/GitHubCallbackPage";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { InboxPage } from "./pages/InboxPage";
import { NeedsReplyPage } from "./pages/NeedsReplyPage";
import { AISummariesPage } from "./pages/AISummariesPage";
import { DraftsPage } from "./pages/DraftsPage";
import { RemindersPage } from "./pages/RemindersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { BrandLogo } from "./components/ui/BrandLogo";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-subtle-mesh flex flex-col items-center justify-center space-y-4">
        <BrandLogo size="lg" to="" />
        <div className="w-8 h-8 rounded-full border-3 border-forest/20 border-t-forest animate-spin" />
        <p className="text-xs font-semibold text-ink-secondary">Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-subtle-mesh flex flex-col items-center justify-center space-y-4">
        <BrandLogo size="lg" to="" />
        <div className="w-8 h-8 rounded-full border-3 border-forest/20 border-t-forest animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signup" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback/github" element={<GitHubCallbackPage />} />

          {/* Authenticated Application Shell & Milestone B Navigation */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/needs-reply" element={<NeedsReplyPage />} />
            <Route path="/summaries" element={<AISummariesPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
