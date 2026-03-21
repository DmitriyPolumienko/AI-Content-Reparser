"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/effects/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Step = "idle" | "enrolling" | "verifying" | "enabled";

export default function SecuritySettings() {
  const [step, setStep] = useState<Step>("idle");
  const [qrUri, setQrUri] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [has2fa, setHas2fa] = useState<boolean | null>(null);
  const { showToast } = useToast();
  const supabase = createClient();

  // Check if 2FA already enrolled
  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.some((f) => f.status === "verified") ?? false;
      setHas2fa(verified);
      if (verified) setStep("enabled");
    });
  }, [supabase]);

  const handleEnroll = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator App",
    });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setFactorId(data.id);
    setQrUri(data.totp.qr_code);
    setStep("enrolling");
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data: challenge, error: challengeErr } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) {
        showToast(challengeErr.message, "error");
        return;
      }
      setChallengeId(challenge.id);

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyErr) {
        showToast(verifyErr.message, "error");
        return;
      }
      setStep("enabled");
      setHas2fa(true);
      showToast("Two-factor authentication enabled!", "success");
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setLoading(true);
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.[0];
    if (!totp) {
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.mfa.unenroll({ factorId: totp.id });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setStep("idle");
    setHas2fa(false);
    showToast("Two-factor authentication disabled.", "info");
  };

  return (
    <div className="glass-card p-6">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">
        Two-Factor Authentication (2FA)
      </p>

      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-slate-300">
              Protect your account with an authenticator app (TOTP).
            </p>
            <Button
              variant="primary"
              className="self-start"
              onClick={handleEnroll}
              disabled={loading || has2fa === null}
            >
              {loading ? "Setting up…" : "Enable 2FA"}
            </Button>
          </motion.div>
        )}

        {step === "enrolling" && (
          <motion.div
            key="enrolling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <p className="text-sm text-slate-300">
              Scan the QR code below with your authenticator app (e.g. Google
              Authenticator, Authy), then enter the 6-digit code to activate.
            </p>

            <div className="flex justify-center p-4 bg-white rounded-xl w-fit mx-auto">
              <QRCodeSVG value={qrUri} size={180} />
            </div>

            <Input
              label="6-Digit Code"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="tracking-widest text-center text-lg max-w-xs"
            />

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verifying…" : "Activate 2FA"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setStep("idle"); setCode(""); setQrUri(""); }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {step === "enabled" && (
          <motion.div
            key="enabled"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <p className="text-sm text-emerald-400 font-medium">2FA is enabled</p>
            </div>
            <p className="text-sm text-slate-400">
              Your account is protected by two-factor authentication.
            </p>
            <Button
              variant="outline"
              className="self-start border-red-500/30 text-red-400 hover:bg-red-500/5 hover:border-red-500/50"
              onClick={handleUnenroll}
              disabled={loading}
            >
              {loading ? "Disabling…" : "Disable 2FA"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
