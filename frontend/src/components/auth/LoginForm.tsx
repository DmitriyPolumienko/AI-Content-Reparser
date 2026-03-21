"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/effects/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

function LoginModeForm({ onTotpRequired }: { onTotpRequired: () => void }) {
  const { showToast } = useToast();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginValues) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) { showToast(error.message, "error"); return; }

    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.nextLevel === "aal2" && aalData.nextLevel !== aalData.currentLevel) {
      onTotpRequired();
      return;
    }
    if (authData.user) window.location.href = "/dashboard";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
      <Button type="submit" variant="primary" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}

function SignupModeForm() {
  const { showToast } = useToast();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupValues) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) showToast(error.message, "error");
    else showToast("Check your email to confirm your account.", "info");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
      <Input label="Confirm Password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" variant="primary" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { showToast(error.message, "error"); setOauthLoading(false); }
  };

  const handleTotpVerify = async () => {
    setTotpLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) { showToast("No 2FA factor found.", "error"); return; }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeError) { showToast(challengeError.message, "error"); return; }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code: totpCode,
      });
      if (verifyError) { showToast(verifyError.message, "error"); return; }

      window.location.href = "/dashboard";
    } finally {
      setTotpLoading(false);
    }
  };

  if (totpRequired) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <div className="glass-card p-8">
            <h2 className="font-display text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
            <p className="text-slate-400 text-sm mb-6">Enter the 6-digit code from your authenticator app.</p>
            <Input
              label="Authentication Code"
              placeholder="000000"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              className="tracking-widest text-center text-lg"
            />
            <Button className="w-full mt-4" onClick={handleTotpVerify} disabled={totpLoading || totpCode.length !== 6}>
              {totpLoading ? "Verifying…" : "Verify"}
            </Button>
            <button
              className="mt-4 text-sm text-slate-400 hover:text-white w-full text-center transition-colors"
              onClick={() => setTotpRequired(false)}
            >
              ← Back to login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-bold text-white">V2<span className="text-emerald-400">Post</span></span>
          <p className="text-slate-400 text-sm mt-2">{mode === "login" ? "Welcome back" : "Create your account"}</p>
        </div>

        <div className="glass-card p-8">
          {/* Google OAuth */}
          <Button variant="outline" className="w-full mb-6" onClick={handleGoogleSignIn} disabled={oauthLoading}>
            <GoogleIcon />
            {oauthLoading ? "Redirecting…" : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {mode === "login"
            ? <LoginModeForm onTotpRequired={() => setTotpRequired(true)} />
            : <SignupModeForm />
          }

          <p className="text-center text-sm text-slate-400 mt-5">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

