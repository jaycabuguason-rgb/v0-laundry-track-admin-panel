"use client";

import { useState } from "react";
import { Eye, EyeOff, Save, X, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Requirement {
  label: string;
  test: (pw: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "At least 8 characters",          test: (pw) => pw.length >= 8 },
  { label: "At least one uppercase letter",  test: (pw) => /[A-Z]/.test(pw) },
  { label: "At least one number",            test: (pw) => /[0-9]/.test(pw) },
  { label: "At least one special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  const passed = requirements.filter((r) => r.test(pw)).length;
  if (pw.length === 0) return { level: 0, label: "",       color: "" };
  if (passed <= 1)     return { level: 1, label: "Weak",   color: "bg-red-500" };
  if (passed <= 2)     return { level: 2, label: "Fair",   color: "bg-yellow-500" };
  if (passed <= 3)     return { level: 2, label: "Fair",   color: "bg-yellow-500" };
  return               { level: 3, label: "Strong", color: "bg-green-500" };
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-medium mb-1.5 block">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 text-sm pr-9"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const [current, setCurrent]     = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirm, setConfirm]     = useState("");
  const [success, setSuccess]     = useState(false);

  const strength = getStrength(newPw);
  const allPassed = requirements.every((r) => r.test(newPw));
  const passwordsMatch = newPw.length > 0 && newPw === confirm;
  const canSave = current.length > 0 && allPassed && passwordsMatch;

  const handleSave = () => {
    if (!canSave) return;
    setSuccess(true);
    setCurrent(""); setNewPw(""); setConfirm("");
    setTimeout(() => setSuccess(false), 4000);
  };

  const handleCancel = () => {
    setCurrent(""); setNewPw(""); setConfirm(""); setSuccess(false);
  };

  return (
    <div className="max-w-md space-y-5">
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Change Password</CardTitle>
          <CardDescription className="text-xs">
            Enter your current password, then set a new secure password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current password */}
          <PasswordInput
            id="current-pw"
            label="Current Password"
            value={current}
            onChange={setCurrent}
            placeholder="Enter current password"
          />

          {/* New password */}
          <PasswordInput
            id="new-pw"
            label="New Password"
            value={newPw}
            onChange={(v) => { setNewPw(v); setSuccess(false); }}
            placeholder="Enter new password"
          />

          {/* Strength bar */}
          {newPw.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3].map((seg) => (
                  <div
                    key={seg}
                    className={cn(
                      "flex-1 rounded-full transition-colors duration-300",
                      strength.level >= seg ? strength.color : "bg-muted"
                    )}
                  />
                ))}
              </div>
              {strength.label && (
                <p className={cn(
                  "text-[11px] font-medium",
                  strength.level === 1 && "text-red-500",
                  strength.level === 2 && "text-yellow-600",
                  strength.level === 3 && "text-green-600",
                )}>
                  {strength.label}
                </p>
              )}
            </div>
          )}

          {/* Requirements checklist */}
          <div className="space-y-1.5 p-3 bg-muted/30 rounded-md border border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Requirements</p>
            {requirements.map((req) => {
              const passed = req.test(newPw);
              return (
                <div key={req.label} className="flex items-center gap-2">
                  {passed
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  }
                  <span className={cn(
                    "text-xs transition-colors",
                    passed ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {req.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Confirm password */}
          <PasswordInput
            id="confirm-pw"
            label="Confirm New Password"
            value={confirm}
            onChange={(v) => { setConfirm(v); setSuccess(false); }}
            placeholder="Re-enter new password"
          />

          {/* Mismatch warning */}
          {confirm.length > 0 && !passwordsMatch && (
            <p className="text-xs text-destructive">Passwords do not match.</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={!canSave}
          onClick={handleSave}
          className="flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save New Password
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
        {success && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Password changed successfully!
          </span>
        )}
      </div>
    </div>
  );
}
