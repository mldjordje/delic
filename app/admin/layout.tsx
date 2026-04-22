import type { Metadata } from "next";
import AdminShellAutoDelic from "@/components/admin/AdminShellAutoDelic";
import { ADMIN_SITE_NAME } from "@/lib/site";
import "./admin-template.css";

export const metadata: Metadata = {
  title: {
    default: ADMIN_SITE_NAME,
    template: `%s | ${ADMIN_SITE_NAME}`,
  },
  description: "Administracija — Auto Delić tehnički pregled",
  manifest: "/manifest-admin.webmanifest",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellAutoDelic>{children}</AdminShellAutoDelic>;
}
