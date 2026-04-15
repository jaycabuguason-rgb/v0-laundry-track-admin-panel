"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/app-shell";
import LoginPage from "@/components/pages/login";
import ForgotPasswordPage from "@/components/pages/forgot-password";
import RegisterPage from "@/components/pages/register";
import ResetPasswordPage from "@/components/pages/reset-password";
import { getSession, getProfile } from "@/lib/actions";

type AuthView = "login" | "forgot-password" | "register" | "reset-password" | "app";

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
  phone: "",
};

export default function Home() {
  const [view, setView] = useState<AuthView>("login");
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(defaultProfile);
  const [sessionChecked, setSessionChecked] = useState(false);

  // On mount, check for an existing Supabase session and restore the logged-in state
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        const profile = await getProfile();
        setAdminProfile({
          name: profile?.full_name ?? session.user.user_metadata?.full_name ?? "Admin",
          email: session.user.email ?? "",
          username: profile?.username ?? session.user.user_metadata?.username ?? "",
          phone: profile?.phone_number ?? "",
        });
        setView("app");
      }
      setSessionChecked(true);
    })();
  }, []);

  // Don't render anything until the session check completes (avoids flash of login page)
  if (!sessionChecked) return null;

  if (view === "forgot-password") {
    return (
      <ForgotPasswordPage
        onBack={() => setView("login")}
        onResetPassword={() => setView("reset-password")}
      />
    );
  }

  if (view === "reset-password") {
    return (
      <ResetPasswordPage
        email={adminProfile.email}
        onBack={() => setView("login")}
      />
    );
  }

  if (view === "register") {
    return <RegisterPage onBack={() => setView("login")} />;
  }

  if (view === "login") {
    return (
      <LoginPage
        onLogin={async (profile) => {
          // Fetch fresh profile data from DB after login to get phone_number etc.
          const dbProfile = await getProfile();
          setAdminProfile({
            name: dbProfile?.full_name ?? profile.name,
            email: profile.email,
            username: dbProfile?.username ?? profile.username,
            phone: dbProfile?.phone_number ?? profile.phone,
          });
          setView("app");
        }}
        onForgotPassword={() => setView("forgot-password")}
        onCreateAccount={() => setView("register")}
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
