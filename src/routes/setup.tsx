import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Setup — Restaurant Name" }] }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("setup_complete").eq("id", 1).maybeSingle();
      if (data?.setup_complete) {
        navigate({ to: "/auth", replace: true });
      } else {
        setChecking(false);
      }
    })();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setSubmitting(true);
    try {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (signUpErr) throw signUpErr;

      // If email confirmation is required, the user won't be active yet
      const needsConfirmation = !signUpData.session;
      if (needsConfirmation) {
        toast.success("Check your email and click the confirmation link to complete setup.");
        setSubmitting(false);
        return;
      }

      // No confirmation required — sign in immediately
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw signInErr;
      const { error: upErr } = await supabase
        .from("app_settings")
        .update({ setup_complete: true, owner_email: email })
        .eq("id", 1);
      if (upErr) throw upErr;
      toast.success("Owner account created.");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Setup failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h1 className="text-glow text-3xl font-semibold text-primary">Restaurant Name</h1>
        <p className="mt-1 text-sm text-muted-foreground">Owner setup — one-time only.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Owner email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@restaurantname.com"
              maxLength={255}
            />
          </div>
          <div>
            <Label htmlFor="pw">Password</Label>
            <PasswordInput
              id="pw"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={72}
            />
          </div>
          <div>
            <Label htmlFor="cf">Confirm password</Label>
            <PasswordInput
              id="cf"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              maxLength={72}
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-brand-gradient text-white shadow-neon">
            {submitting ? "Creating…" : "Create owner account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
