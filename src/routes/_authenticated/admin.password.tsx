import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { openAdminMenu } from "./admin";

export const Route = createFileRoute("/_authenticated/admin/password")({
  component: PasswordPage,
});

function PasswordPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [current, setCurrent] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Could not resolve owner email.");
    setBusy(true);
    try {
      // Verify current password by attempting a sign-in
      const { error: vErr } = await supabase.auth.signInWithPassword({ email, password: current });
      if (vErr) throw new Error("Current password is incorrect.");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://papi-s-lounge-digital-menu.vercel.app/reset-password",
      });
      if (error) throw error;
      setSent(true);
      toast.success("Confirmation email sent to the owner address.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="rounded-b-[28px] bg-brand-gradient text-white shadow-neon">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 md:px-8">
          <div>
            <h1 className="text-glow text-3xl font-semibold tracking-wide md:text-4xl">Change Password</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/80">Owner only</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={openAdminMenu}
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-10 md:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          {sent ? (
            <div className="text-center">
              <p className="text-glow text-xl font-semibold text-primary">Check your email</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium">{email}</span>. Click it
                to set a new password.
              </p>
            </div>
          ) : (
            <form onSubmit={sendReset} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For your security, confirm your current password. We&apos;ll send a confirmation link
                to <span className="font-medium text-foreground">{email ?? "the owner address"}</span>.
                The change only applies after you click that link.
              </p>
              <div>
                <Label htmlFor="cp">Current password</Label>
                <PasswordInput
                  id="cp"
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-brand-gradient text-white">
                {busy ? "Sending…" : "Send confirmation email"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
