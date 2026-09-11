"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabase } from "@/src/lib/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      setAuthenticated(true);
      setChecking(false);
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }

        if (!session) {
          router.replace("/login");
          return;
        }

        setAuthenticated(true);
        setChecking(false);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking || !authenticated) {
    return (
      <main className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return <>{children}</>;
}