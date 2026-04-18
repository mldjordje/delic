"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/prijava";
      }}
    >
      Odjavi se
    </button>
  );
}
