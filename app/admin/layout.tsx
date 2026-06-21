import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShellAutoDelic from "@/components/admin/AdminShellAutoDelic";
import { getSessionUser } from "@/lib/auth/guards";
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    redirect("/prijava");
  }

  return <AdminShellAutoDelic role={user.role as "admin" | "staff"}>{children}</AdminShellAutoDelic>;
}
