"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/app-shell";
import LoginPage from "@/components/pages/login";
import ForgotPasswordPage from "@/components/pages/forgot-password";
import { createClient } from "@/lib/supabase/client";

type AuthView = "loading" | "login" | "forgot-password" | "app";

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
  const [view, setView] = useState<AuthView>("loading");
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(defaultProfile);

  useEffect(() => {
    const supabase = createClient();

    // Check existing session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setView(user ? "app" : "login");
      if (user) {
        setAdminProfile((prev) => ({
          ...prev,
          email: user.email ?? prev.email,
          name: (user.user_metadata?.full_name as string) ?? prev.name,
        }));
      }
    });

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAdminProfile((prev) => ({
          ...prev,
          email: session.user.email ?? prev.email,
          name: (session.user.user_metadata?.full_name as string) ?? prev.name,
        }));
        setView("app");
      } else {
        setView("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.93_0.04_240)]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
