import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — AutoDoctor AI" },
      { name: "description", content: "Log in to AutoDoctor AI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Clear previous errors on a new attempt

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    console.log("Supabase login result:", { data, error });

    if (error) {
      console.error("Login error details", error);
      // Map Supabase error messages or fallback to default
      const msg =
        error.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : error.message;

      setErrorMessage(msg);
      toast.error(msg); // Trigger toast as well
      return;
    }

    if (!data?.session) {
      console.error("Login returned no session", data);
      const msg = "Sign-in did not return an active session. Check your credentials or verify your email.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    toast.success(t("auth.welcomeBack"));
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8">
          <h1 className="font-display text-2xl font-bold">{t("auth.login.h1")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.login.sub")}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Inline Error Alert Container */}
            {errorMessage && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null); // Clear error when typing
                }}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {t("auth.forgot")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null); // Clear error when typing
                }}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.newHere")}{" "}
            <Link to="/register" className="text-primary hover:underline">
              {t("auth.createAcct")}
            </Link>
          </p>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}