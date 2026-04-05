"use client";

import { useState } from "react";
import AppShell from "@/components/app-shell";
import LoginPage from "@/components/pages/login";
import ForgotPasswordPage from "@/components/pages/forgot-password";

type AuthView = "login" | "forgot-password" | "app";

export interface AdminProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
}

const defaultProfile: AdminProfile = {
  name: "Admin User",
  email: "admin@laundrytrack.ph",
  username: "admin",
  phone: "+63 912 345 6789",
};

export default function Home() {
  const [view, setView] = useState<AuthView>("login");
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(defaultProfile);

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

  return (
    <AppShell
      onSignOut={() => setView("login")}
      adminProfile={adminProfile}
      onProfileUpdate={(updates) => setAdminProfile((prev) => ({ ...prev, ...updates }))}
    />
  );
}
