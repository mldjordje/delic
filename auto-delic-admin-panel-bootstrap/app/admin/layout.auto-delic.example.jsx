/**
 * Primer layout-a za Auto Delić: zameni sadržaj postojećeg layout.jsx ili preimenuj.
 */
import AdminShellAutoDelic from "@/components/admin/AdminShellAutoDelic";
import "./admin-template.css";

const ADMIN_TITLE = "Auto Delić | Admin";

export const metadata = {
  title: {
    default: ADMIN_TITLE,
    template: `%s | ${ADMIN_TITLE}`,
  },
  description: "Admin panel — tehnički pregled vozila, termini i klijenti.",
  manifest: "/admin.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "32x32" }],
  },
};

export default function AdminLayout({ children }) {
  return <AdminShellAutoDelic>{children}</AdminShellAutoDelic>;
}
