// File: src/hooks/useAuth.ts
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSession } from "@/types";
import { APP_SESSION_KEY, ROLES } from "@/lib/constants";

export function useAuth(requiredRole?: 'admin' | 'staff') {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(APP_SESSION_KEY);
    if (!stored) {
      router.push("/kasir/login");
      return;
    }

    const parsedSession: UserSession = JSON.parse(stored);

    // Cek Timeout (1 Jam = 3600000 ms)
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - parsedSession.loginTime > ONE_HOUR) {
      alert("Sesi habis, silakan login kembali.");
      localStorage.removeItem(APP_SESSION_KEY);
      router.push("/kasir/login");
      return;
    }

    // Cek Role Access
    if (requiredRole && parsedSession.role !== requiredRole) {
      // Jika butuh admin tapi yang login staff -> tendang ke kasir dashboard
      if (requiredRole === ROLES.ADMIN && parsedSession.role === ROLES.STAFF) {
        router.push("/kasir");
        return;
      }
    }

    setSession(parsedSession);
    setLoading(false);
  }, [router, requiredRole]);

  const logout = () => {
    localStorage.removeItem(APP_SESSION_KEY);
    router.push("/kasir/login");
  };

  return { session, loading, logout };
}