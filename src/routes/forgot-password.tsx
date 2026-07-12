import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — AutoDoctor AI" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Check your inbox for a reset link.");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8">
          <h1 className="font-display text-2xl font-bold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>
          {sent ? (
            <p className="mt-6 rounded-lg bg-primary/10 p-4 text-sm">
              If an account exists for <span className="font-medium">{email}</span>, a reset link is
              on its way.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
