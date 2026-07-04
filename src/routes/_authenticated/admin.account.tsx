import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, Field, PageHeader, PrimaryButton, inputCls } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/account")({
  component: AccountPage,
});

function AccountPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div>
      <PageHeader title="Account" description="Manage your admin credentials." />
      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold">Signed in as</h2>
          <p className="mt-1 text-sm text-muted-foreground">{email || "—"}</p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <Field label="New password" hint="Minimum 8 characters. Leaked passwords are rejected.">
              <input
                type="password"
                autoComplete="new-password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
            </Field>
            <PrimaryButton disabled={busy || password.length < 8}>
              {busy ? "Updating…" : "Update password"}
            </PrimaryButton>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Session</h2>
          <button
            onClick={signOut}
            className="mt-3 inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Sign out
          </button>
        </Card>
      </div>
    </div>
  );
}