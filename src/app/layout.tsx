"use client";

import { useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      supabase.auth.signOut();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
