import { createFileRoute, Link, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Menu as MenuIcon, QrCode, Eye, Pencil, KeyRound, UtensilsCrossed } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useIdleLogout } from "@/hooks/useIdleLogout";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Papi's Lounge" }] }),
  component: AdminLayout,
});

export const AdminMenuContext = { current: null as null | (() => void) };

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Expose menu opener so child routes' BrandHeader can trigger it
  useEffect(() => {
    AdminMenuContext.current = () => setOpen(true);
    return () => {
      AdminMenuContext.current = null;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/auth", replace: true });
  }, [queryClient, router, navigate]);

  const handleIdle = useCallback(async () => {
    toast.info("Signed out due to inactivity");
    await handleLogout();
  }, [handleLogout]);

  useIdleLogout(15 * 60 * 1000, handleIdle);

  const items: Array<{
    to: "/admin" | "/admin/preview" | "/admin/qr" | "/admin/password";
    label: string;
    icon: typeof UtensilsCrossed;
    exact?: boolean;
  }> = [
    { to: "/admin", label: "Menu Editor", icon: UtensilsCrossed, exact: true },
    { to: "/admin/preview", label: "Preview Menu", icon: Eye },
    { to: "/admin/qr", label: "QR Code", icon: QrCode },
    { to: "/admin/password", label: "Change Password", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="hidden" aria-hidden />
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] bg-card">
          <SheetHeader>
            <SheetTitle className="text-glow text-2xl text-primary">Papi&apos;s Lounge</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1">
            {items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: it.exact }}
                activeProps={{ className: "bg-primary/10 text-primary" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="mt-2 justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </nav>
          <p className="mt-6 text-xs text-muted-foreground">
            Tip: tap <MenuIcon className="inline h-3 w-3" /> in the header anytime to open this menu.
          </p>
        </SheetContent>
      </Sheet>

      <Outlet />
    </div>
  );
}

export function openAdminMenu() {
  AdminMenuContext.current?.();
}
