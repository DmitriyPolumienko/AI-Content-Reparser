"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { updateEmail } from "@/app/settings/profile/actions";
import { useToast } from "@/components/effects/Toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ProfileFormProps {
  email: string;
  userId: string;
}

export default function ProfileForm({ email, userId }: ProfileFormProps) {
  const [newEmail, setNewEmail] = useState(email);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail === email) {
      showToast("No changes made.", "info");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.set("email", newEmail);
    const result = await updateEmail(fd);
    setLoading(false);
    if (result.error) {
      showToast(result.error, "error");
    } else if (result.success) {
      showToast(result.success, "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      {/* Info card */}
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Account Info</p>
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs text-slate-500">User ID</span>
            <p className="text-sm text-slate-300 font-mono mt-0.5 break-all">{userId}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Current Email</span>
            <p className="text-sm text-white mt-0.5">{email}</p>
          </div>
        </div>
      </div>

      {/* Update email card */}
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Update Email</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Email Address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@example.com"
            required
          />
          <p className="text-xs text-slate-500">
            A confirmation link will be sent to both your old and new email addresses.
          </p>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="self-start"
          >
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
