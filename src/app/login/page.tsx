"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Sparkles } from "lucide-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { supabase } from "@/src/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        router.replace("/");
      }
    }

    checkExistingSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session) {
        router.replace("/");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top-left branding */}
      <div className="absolute left-6 top-6 z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-5 w-5" />
          </div>

          <span className="text-sm font-semibold tracking-tight">
            CloudOps AI
          </span>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-24">
        <div className="grid w-full max-w-5xl items-center gap-16 lg:grid-cols-[1fr_420px]">
          {/* Left side */}
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered infrastructure operations
              </div>

              <h1 className="text-5xl font-semibold tracking-[-0.04em]">
                Operate your cloud
                <br />
                <span className="text-muted-foreground">
                  with intelligence.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
                Monitor infrastructure, investigate incidents, manage
                deployments, and interact with your DevOps tools through
                one intelligent workspace.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
                <div className="rounded-xl border bg-background/70 p-4 backdrop-blur">
                  <ShieldCheck className="mb-3 h-5 w-5" />
                  <p className="text-sm font-medium">
                    Secure by design
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your credentials stay protected.
                  </p>
                </div>

                <div className="rounded-xl border bg-background/70 p-4 backdrop-blur">
                  <Activity className="mb-3 h-5 w-5" />
                  <p className="text-sm font-medium">
                    Unified operations
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Connect your DevOps ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Login card */}
          <section className="w-full">
            <div className="rounded-2xl border bg-background/95 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl sm:p-8">
              <div className="mb-7 text-center lg:text-left">
                <div className="mb-5 flex justify-center lg:hidden">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  Welcome to CloudOps AI
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to continue to your workspace.
                </p>
              </div>

              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "hsl(var(--primary))",
                        brandAccent: "hsl(var(--primary))",
                        brandButtonText:
                          "hsl(var(--primary-foreground))",
                        defaultButtonBackground:
                          "hsl(var(--background))",
                        defaultButtonBackgroundHover:
                          "hsl(var(--muted))",
                        defaultButtonText:
                          "hsl(var(--foreground))",
                        inputBackground:
                          "hsl(var(--background))",
                        inputBorder:
                          "hsl(var(--border))",
                        inputBorderFocus:
                          "hsl(var(--foreground))",
                        inputText:
                          "hsl(var(--foreground))",
                        inputPlaceholder:
                          "hsl(var(--muted-foreground))",
                      },
                      radii: {
                        borderRadiusButton: "0.625rem",
                        buttonBorderRadius: "0.625rem",
                        inputBorderRadius: "0.625rem",
                      },
                    },
                  },
                  className: {
                    button: "font-medium transition-all",
                    input: "transition-all",
                  },
                }}
                providers={[]}
              />

              <p className="mt-6 text-center text-[11px] leading-5 text-muted-foreground">
                By continuing, you agree to use CloudOps AI responsibly
                and verify critical infrastructure actions.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}