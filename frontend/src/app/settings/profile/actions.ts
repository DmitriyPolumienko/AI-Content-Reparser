"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateEmail(formData: FormData) {
  const newEmail = formData.get("email") as string;
  if (!newEmail) return { error: "Email is required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) return { error: error.message };

  return {
    success:
      "Confirmation links have been sent to both your old and new email addresses.",
  };
}
