"use client";

import { useState } from "react";
import { Eye, EyeOff, WashingMachine, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterPageProps {
  onBack: () => void;
  onSignupComplete: (email: string) => void;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

// Simulated existing emails for demo purposes
const EXISTING_EMAILS = ["admin@laundrytrack.ph", "test@example.com"];

export default function RegisterPage({ onBack, onSignupComplete }: RegisterPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [resentEmail, setResentEmail] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!fullName.trim()) {
      errs.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    } else if (EXISTING_EMAILS.includes(email.trim().toLowerCase())) {
      errs.email = "This email is already registered. Try logging in instead.";
    }

    if (!username.trim()) {
      errs.username = "Username is required.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      errs.confirmPassword = "Passwords do not match.";
    }

    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSuccess(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleResendEmail = () => {
    setResentEmail(true);
    setTimeout(() => setResentEmail(false), 5000);
  };

  const clearError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c249c] px-4 py-8">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
              <WashingMachine className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
          </div>

          <h1 className="text-base font-semibold text-foreground text-center mb-5">Create Admin Account</h1>

          {success ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-5 py-2">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="text-base font-bold text-foreground">Account Created!</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Please check your email at{" "}
                  <span className="font-semibold text-foreground">{email}</span>{" "}
                  and verify your address before logging in.
                </p>
              </div>

              <div className="w-full rounded-lg bg-muted/40 border border-border px-4 py-3 text-center space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {"Didn't receive an email? Check your spam folder or"}
                </p>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resentEmail}
                  className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resentEmail ? "Verification email sent!" : "Resend verification email"}
                </button>
              </div>

              <Button
                className="w-full cursor-pointer flex items-center justify-center gap-2"
                onClick={() => onSignupComplete(email)}
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* ── Registration form ── */
            <div className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Juan dela Cruz"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
                  onKeyDown={handleKeyDown}
                  className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-email" className="text-xs font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="admin@laundrytrack.ph"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  onKeyDown={handleKeyDown}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username" className="text-xs font-medium text-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. admin_juan"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
                  onKeyDown={handleKeyDown}
                  className={errors.username ? "border-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-[11px] text-destructive">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-password" className="text-xs font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                    onKeyDown={handleKeyDown}
                    className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoComplete="new-password"
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
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                    onKeyDown={handleKeyDown}
                    className={`pr-10 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <Button className="w-full mt-1 cursor-pointer" onClick={handleSubmit}>
                Create Account
              </Button>

              {/* Back to login */}
              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onBack}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Login
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-white/50 mt-5">
          &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
