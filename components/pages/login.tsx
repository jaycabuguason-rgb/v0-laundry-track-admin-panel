"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, WashingMachine, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/actions";

interface LoginPageProps {
  onLogin: (profile: { name: string; email: string; username: string; phone: string }) => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
}

export default function LoginPage({ onLogin, onForgotPassword, onCreateAccount }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefillBanner, setPrefillBanner] = useState(false);

  useEffect(() => {
    const prefillEmail = sessionStorage.getItem("prefill_email");
    const prefillPassword = sessionStorage.getItem("prefill_password");
    if (prefillEmail && prefillPassword) {
      setEmail(prefillEmail);
      setPassword(prefillPassword);
      setRememberMe(true);
      setPrefillBanner(true);
      sessionStorage.removeItem("prefill_email");
      sessionStorage.removeItem("prefill_password");
    }
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error === "Invalid login credentials"
        ? "Incorrect email or password. Please try again."
        : result.error);
      return;
    }
    onLogin({
      name: result.user?.user_metadata?.full_name ?? "Admin",
      email: result.user?.email ?? email,
      username: result.user?.user_metadata?.username ?? "",
      phone: "",
    });
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

          {/* Prefill banner */}
          {prefillBanner && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-800">
              <span className="shrink-0 mt-0.5">&#10003;</span>
              <span className="flex-1 leading-relaxed">
                Credentials filled from your recent registration. Just click Login to continue.
              </span>
              <button
                type="button"
                onClick={() => setPrefillBanner(false)}
                className="shrink-0 text-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
              {error}
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
                onChange={(e) => { setEmail(e.target.value); setError(false); }}
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
              disabled={loading}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Logging in...</> : "Login"}
            </Button>

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
