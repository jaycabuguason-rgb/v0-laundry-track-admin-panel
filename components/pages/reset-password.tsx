"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Eye, EyeOff, WashingMachine, ArrowLeft,
  CheckCircle2, ShieldCheck, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface ResetPasswordPageProps {
  /** The email the reset link was sent to (passed in from forgot-password flow) */
  email?: string;
  onBack: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Simulated correct code for demo purposes */
const DEMO_CODE = "123456";
const RESEND_COUNTDOWN = 60;

// ─── Password strength helpers ───────────────────────────────────────────────

interface PasswordRequirements {
  minLength: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
}

function getRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function getStrength(reqs: PasswordRequirements): 0 | 1 | 2 | 3 {
  const count = Object.values(reqs).filter(Boolean).length;
  if (count <= 1) return 1; // Weak
  if (count <= 3) return 2; // Fair
  return 3;                 // Strong
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: "Enter Code" },
    { num: 2, label: "New Password" },
    { num: 3, label: "Done" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-6 select-none">
      {steps.map((s, i) => {
        const done = step > s.num;
        const active = step === s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-10 mx-1 mb-4 transition-colors",
                  step > s.num ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Confirm leave dialog ─────────────────────────────────────────────────────

function ConfirmLeaveDialog({
  onStay,
  onLeave,
}: {
  onStay: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-xs px-6 py-6 flex flex-col gap-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Are you sure?</p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Your reset progress will be lost.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button className="w-full cursor-pointer" onClick={onStay}>
            Stay
          </Button>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={onLeave}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResetPasswordPage({
  email = "admin@laundrytrack.ph",
  onBack,
}: ResetPasswordPageProps) {
  const [step, setStep] = useState<Step>(1);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Step 1 state
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 2 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const reqs = getRequirements(newPassword);
  const strength = getStrength(reqs);
  const allReqsMet = Object.values(reqs).every(Boolean);
  const codeComplete = code.every((d) => d !== "");

  // ── Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Resend handler
  const handleResend = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(RESEND_COUNTDOWN);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── OTP input handlers
  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...code];
    updated[index] = digit;
    setCode(updated);
    setCodeError(null);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const updated = [...code];
      pasted.split("").forEach((ch, i) => { updated[i] = ch; });
      setCode(updated);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  // ── Verify code
  const handleVerifyCode = () => {
    const entered = code.join("");
    if (entered !== DEMO_CODE) {
      setCodeError("Invalid code. Please try again.");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 10);
      return;
    }
    setCodeError(null);
    setStep(2);
  };

  // ── Save new password
  const handleSavePassword = () => {
    if (!allReqsMet) return;
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError(null);
    setStep(3);
  };

  // ── Back button (steps 1 & 2 show confirm dialog)
  const handleBack = useCallback(() => {
    if (step === 1 || step === 2) {
      setShowLeaveDialog(true);
    } else {
      onBack();
    }
  }, [step, onBack]);

  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-400", "bg-green-500"][strength];
  const strengthTextColor = ["", "text-red-500", "text-yellow-600", "text-green-600"][strength];

  return (
    <>
      {showLeaveDialog && (
        <ConfirmLeaveDialog
          onStay={() => setShowLeaveDialog(false)}
          onLeave={() => { setShowLeaveDialog(false); onBack(); }}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-[#0c249c] px-4 py-8">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative w-full max-w-sm">
          <div className="bg-card rounded-2xl shadow-lg border border-border px-8 py-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
                <WashingMachine className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">LaundryTrack</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sunshine Laundry Shop</p>
            </div>

            {/* Step Indicator */}
            <StepIndicator step={step} />

            {/* ── Step 1: Enter Code ── */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <h1 className="text-base font-semibold text-foreground">Enter Confirmation Code</h1>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    We sent a 6-digit confirmation code to your email. Please enter it below.
                  </p>
                </div>

                {/* Readonly email */}
                <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground text-center">
                  Code sent to: <span className="font-medium text-foreground">{email}</span>
                </div>

                {/* OTP Inputs */}
                <div
                  className={cn(
                    "flex justify-center gap-2",
                    shaking && "animate-[shake_0.5s_ease-in-out]"
                  )}
                  style={shaking ? { animation: "shake 0.5s ease-in-out" } : {}}
                  onPaste={handleCodePaste}
                >
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className={cn(
                        "w-10 h-12 text-center text-base font-semibold rounded-lg border bg-background transition-colors outline-none",
                        "focus:ring-2 focus:ring-primary focus:border-primary",
                        codeError
                          ? "border-destructive focus:ring-destructive"
                          : "border-input"
                      )}
                      aria-label={`Code digit ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Code error */}
                {codeError && (
                  <p className="text-[11px] text-destructive text-center">{codeError}</p>
                )}

                {/* Resend */}
                <p className="text-xs text-muted-foreground text-center">
                  {"Didn't receive a code? "}
                  {resendCountdown > 0 ? (
                    <span className="text-muted-foreground">
                      Resend available in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-primary font-medium hover:underline cursor-pointer"
                    >
                      Resend
                    </button>
                  )}
                </p>

                <Button
                  className="w-full cursor-pointer"
                  disabled={!codeComplete}
                  onClick={handleVerifyCode}
                >
                  Verify Code
                </Button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            )}

            {/* ── Step 2: Set New Password ── */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <h1 className="text-base font-semibold text-foreground">Set New Password</h1>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Create a new secure password for your account.
                  </p>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new-password" className="text-xs font-medium text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="flex flex-col gap-1 mt-0.5">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              strength >= level ? strengthColor : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn("text-[11px] font-medium", strengthTextColor)}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm-password" className="text-xs font-medium text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
                      className={cn(
                        "pr-10",
                        passwordError ? "border-destructive focus-visible:ring-destructive" : ""
                      )}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-[11px] text-destructive">{passwordError}</p>
                  )}
                </div>

                {/* Requirements checklist */}
                <div className="flex flex-col gap-1.5 rounded-lg bg-muted px-3 py-3">
                  {[
                    { key: "minLength", label: "At least 8 characters" },
                    { key: "uppercase", label: "At least one uppercase letter" },
                    { key: "number",    label: "At least one number" },
                    { key: "special",  label: "At least one special character" },
                  ].map(({ key, label }) => {
                    const met = reqs[key as keyof PasswordRequirements];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors",
                            met ? "bg-green-500" : "bg-border"
                          )}
                        >
                          {met && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span
                          className={cn(
                            "text-[11px] transition-colors",
                            met ? "text-green-700 font-medium" : "text-muted-foreground"
                          )}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  className="w-full cursor-pointer"
                  disabled={!allReqsMet || !confirmPassword}
                  onClick={handleSavePassword}
                >
                  Save New Password
                </Button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h1 className="text-base font-semibold text-foreground">Password Reset Successful!</h1>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your password has been updated.<br />
                    You can now log in with your new password.
                  </p>
                </div>
                <Button className="w-full cursor-pointer" onClick={onBack}>
                  Back to Login
                </Button>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  For security, all other sessions have been logged out.
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-white/50 mt-5">
            &copy; {new Date().getFullYear()} LaundryTrack. All rights reserved.
          </p>
        </div>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
      `}</style>
    </>
  );
}
