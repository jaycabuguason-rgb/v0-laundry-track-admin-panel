"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import LoginPage from "@/components/pages/login";
import ForgotPasswordPage from "@/components/pages/forgot-password";

type AuthView = "login" | "forgot-password" | "app";

export default function Home() {
  const [view, setView] = useState<AuthView>("login");

  if (view === "forgot-password") {
    return <ForgotPasswordPage onBack={() => setView("login")} />;
  }

  if (view === "login") {
    return (
      <LoginPage
        onLogin={() => setView("app")}
        onForgotPassword={() => setView("forgot-password")}
      />
    );
  }

  return <AppShell onSignOut={() => setView("login")} />;
}
