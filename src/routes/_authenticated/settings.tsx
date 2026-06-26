import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — AutoDoctor AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const t = useT();

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
    toast.success(t("set.saved"));
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  async function changePassword() {
    if (newPassword.length < 6) return toast.error(t("set.pwShort"));
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return toast.error(error.message);
    toast.success(t("set.pwUpdated"));
    setNewPassword("");
  }

  async function deleteAccount() {
    if (!confirm(t("set.delete.confirm"))) return;
    // Best-effort: delete diagnoses + profile; full auth.users deletion requires service role.
    await supabase.from("diagnoses").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    toast.success(t("set.removed"));
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{t("set.title")}</h1>

      <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{t("set.profile")}</h2>
        <form onSubmit={saveProfile} className="mt-4 grid gap-4">
          <Field label={t("set.fullName")}><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
          <Field label={t("set.email")}><Input value={user.email ?? ""} disabled /></Field>

          <div className="mt-2">
            <div className="text-sm font-semibold">{t("set.defVehicle")}</div>
            <p className="text-xs text-muted-foreground">{t("set.defVehicle.desc")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label={t("diag.year")}><Input value={year} onChange={(e) => setYear(e.target.value)} /></Field>
            <Field label={t("diag.make")}><Input value={make} onChange={(e) => setMake(e.target.value)} /></Field>
            <Field label={t("diag.model")}><Input value={model} onChange={(e) => setModel(e.target.value)} /></Field>
            <Field label={t("diag.mileage")}><Input value={mileage} onChange={(e) => setMileage(e.target.value)} /></Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">{t("set.save")}</Button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{t("set.changePw")}</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label={t("set.newPw")} className="flex-1"><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></Field>
          <Button onClick={changePassword} variant="outline">{t("set.updatePw")}</Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <h2 className="font-display text-xl font-semibold text-destructive">{t("set.danger")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("set.danger.desc")}</p>
        <Button onClick={deleteAccount} variant="destructive" className="mt-4">{t("set.delete")}</Button>
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