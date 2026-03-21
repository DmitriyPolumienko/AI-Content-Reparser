"use client";

import { useState } from "react";
import ProfileForm from "@/components/settings/ProfileForm";
import UserDashboard from "@/components/settings/UserDashboard";

type Tab = "profile" | "dashboard";

interface ProfileTabsProps {
  email: string;
  userId: string;
  createdAt: string;
  plan: string;
  subscriptionStatus: string | null;
  charsBalance: number;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "profile", label: "Profile" },
];

export default function ProfileTabs({
  email,
  userId,
  createdAt,
  plan,
  subscriptionStatus,
  charsBalance,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-8 border-b border-white/5">
        {TABS.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 border-b-2 -mb-px ${
                isActive
                  ? "text-emerald-400 border-emerald-400 bg-emerald-500/5"
                  : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "profile" ? (
        <ProfileForm email={email} userId={userId} />
      ) : (
        <UserDashboard
          userId={userId}
          email={email}
          createdAt={createdAt}
          plan={plan}
          subscriptionStatus={subscriptionStatus}
          charsBalance={charsBalance}
        />
      )}
    </div>
  );
}
