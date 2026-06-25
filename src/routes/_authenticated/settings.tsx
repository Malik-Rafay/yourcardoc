import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — AutoDoctor AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const profileQ = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [fullName, setFullName] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const p = profileQ.data;
    if (!p) return;
    setFullName(p.full_name ?? "");
    setYear(p.default_year ?? "");
    setMake(p.default_make ?? "");
    setModel(p.default_model ?? "");
    setMileage(p.default_mileage ?? "");
  }, [profileQ.data]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      default_year: year || null,
      default_make: make || null,
      default_model: model || null,
      default_mileage: mileage || null,
      updated_at: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function changePassword() {
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setNewPassword("");
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and all data? This cannot be undone.")) return;
    // Best-effort: delete diagnoses + profile; full auth.users deletion requires service role.
    await supabase.from("diagnoses").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    toast.success("Account data removed");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-display text-xl font-semibold">Profile</h2>
        <form onSubmit={saveProfile} className="mt-4 grid gap-4">
          <Field label="Full name"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
          <Field label="Email"><Input value={user.email ?? ""} disabled /></Field>

          <div className="mt-2">
            <div className="text-sm font-semibold">Default vehicle</div>
            <p className="text-xs text-muted-foreground">Pre-fills the diagnose form.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Year"><Input value={year} onChange={(e) => setYear(e.target.value)} /></Field>
            <Field label="Make"><Input value={make} onChange={(e) => setMake(e.target.value)} /></Field>
            <Field label="Model"><Input value={model} onChange={(e) => setModel(e.target.value)} /></Field>
            <Field label="Mileage"><Input value={mileage} onChange={(e) => setMileage(e.target.value)} /></Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Save profile</Button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-display text-xl font-semibold">Change password</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="New password" className="flex-1"><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></Field>
          <Button onClick={changePassword} variant="outline">Update password</Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <h2 className="font-display text-xl font-semibold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">Permanently delete your account data.</p>
        <Button onClick={deleteAccount} variant="destructive" className="mt-4">Delete account</Button>
      </section>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}