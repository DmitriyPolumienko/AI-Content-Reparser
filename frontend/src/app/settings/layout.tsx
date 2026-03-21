import type { Metadata } from "next";
import SettingsShell from "@/components/settings/SettingsShell";

export const metadata: Metadata = {
  title: {
    template: "%s | Settings — V2Post",
    default: "Settings — V2Post",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsShell>{children}</SettingsShell>;
}
