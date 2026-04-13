"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, WashingMachine, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginPageProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  prefillEmail?: string;
  showSignupSuccess?: boolean;
  onDismissSignupSuccess?: () => void;
}

export default function LoginPage({
  onLogin,
  onForgotPassword,
  onCreateAccount,
  prefillEmail = "",
  showSignupSuccess = false,
  onDismissSignupSuccess,
}: LoginPageProps) {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(false);
  const [showUnverifiedWarning, setShowUnverifiedWarning] = useState(false);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync prefillEmail when it changes (e.g. coming back from register)
  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  // Auto-dismiss signup success banner after 6 seconds
  useEffect(() => {
    if (showSignupSuccess) {
      bannerTimerRef.current = setTimeout(() => {
        onDismissSignupSuccess?.();
      }, 6000);
    }
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [showSignupSuccess, onDismissSignupSuccess]);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError(true);
      setShowUnverifiedWarning(false);
      return;
    }
    setError(false);
    // If arriving from signup and email matches, warn about email verification
    if (prefillEmail && email.trim().toLowerCase() === prefillEmail.toLowerCase()) {
      setShowUnverifiedWarning(true);
      return;
    }
    setShowUnverifiedWarning(false);
    onLogin();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c249c] px-4">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
              <WashingMachine className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
          </div>

          <h1 className="text-base font-semibold text-foreground text-center mb-6">Admin Login</h1>

          {/* Signup success banner */}
          {showSignupSuccess && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-green-800 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
              <span className="flex-1">Account created successfully! Please verify your email before logging in.</span>
              <button
                type="button"
                onClick={() => {
                  if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
                  onDismissSignupSuccess?.();
                }}
                className="shrink-0 text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
              Please fill in all fields.
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Email or Username
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@laundrytrack.ph"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false); setShowUnverifiedWarning(false); }}
                onKeyDown={handleKeyDown}
                className={error && !email.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  onKeyDown={handleKeyDown}
                  className={`pr-10 ${error && !password.trim() ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-input accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">Remember me</span>
            </label>

            {/* Login button */}
            <Button
              className="w-full mt-1 cursor-pointer"
              onClick={handleLogin}
            >
              Login
            </Button>

            {/* Unverified email warning */}
            {showUnverifiedWarning && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-300 px-3 py-2.5 text-xs text-yellow-900 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-600 mt-0.5" />
                Please verify your email first. Check your inbox for a verification link.
              </div>
            )}

            {/* Forgot password */}
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-primary hover:underline text-center cursor-pointer transition-colors"
            >
              Forgot Password?
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Create Account */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/5 cursor-pointer"
              onClick={onCreateAccount}
            >
              Create Account
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/50 mt-5">
          &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
