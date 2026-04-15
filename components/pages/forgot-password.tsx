"use client";

import { useState } from "react";
import { WashingMachine, ArrowLeft, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordEmail } from "@/lib/actions";

interface ForgotPasswordPageProps {
  onBack: () => void;
  onResetPassword?: () => void;
}

export default function ForgotPasswordPage({ onBack, onResetPassword }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);
    await resetPasswordEmail(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.93_0.04_240)] px-4">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.5 0.2 240) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="bg-card rounded-2xl shadow-lg border border-border px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
              <WashingMachine className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
          </div>

          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-base font-semibold text-foreground">Reset Link Sent!</h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We have sent a password reset link to:
                </p>
                <p className="text-sm font-semibold text-foreground">{email}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please check your inbox and spam folder.<br />
                The link will expire in 30 minutes.
              </p>
              {onResetPassword && (
                <Button className="w-full cursor-pointer" onClick={onResetPassword}>
                  Enter Confirmation Code
                </Button>
              )}
              <Button variant="outline" className="w-full cursor-pointer" onClick={onBack}>
                Back to Login
              </Button>
              <p className="text-xs text-muted-foreground">
                {"Didn't receive the email? "}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Resend reset link
                </button>
              </p>
            </div>
          ) : (
            /* Form state */
            <>
              <h1 className="text-base font-semibold text-foreground text-center mb-2">
                Forgot Password
              </h1>
              <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
                Enter your email address and we will send you a reset link.
              </p>

              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium text-center">
                  Please enter your email address.
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reset-email" className="text-xs font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="admin@laundrytrack.ph"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(false); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className={`pl-9 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <Button className="w-full cursor-pointer" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}
