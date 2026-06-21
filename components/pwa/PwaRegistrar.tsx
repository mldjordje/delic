"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost";
    if (!isSecure) return;

    // Ako je već postojao SW (npr. zaglavljeni stari cache-first build na
    // klijentovom laptopu), reload-uj jednom čim novi SW preuzme kontrolu da
    // bi se učitao svež app-shell umesto keširane stare verzije.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    });

    void navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        void reg.update().catch(() => undefined);
      })
      .catch(() => null);
  }, []);

  return null;
}

