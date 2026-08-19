import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { grantEditor, listEditors, revokeRole } from "@/lib/access.functions";

export const Route = createFileRoute("/_authenticated/access")({
  head: () => ({
    meta: [
      { title: "Kelola Akses — Tontonan" },
      {
        name: "description",
        content: "Beri atau cabut hak edit katalog untuk orang lain.",
      },
      { property: "og:title", content: "Kelola Akses — Tontonan" },
      { property: "og:description", content: "Atur siapa saja yang boleh mengedit katalog." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const fetchEditors = useServerFn(listEditors);
  const grant = useServerFn(grantEditor);
  const revoke = useServerFn(revokeRole);
  const [email, setEmail] = useState("");

  const { data } = useQuery({
    queryKey: ["editors"],
    queryFn: () => fetchEditors(),
    enabled: isAdmin,
  });

  const grantMutation = useMutation({
    mutationFn: (value: string) => grant({ data: { email: value } }),
    onSuccess: () => {
      toast.success("Hak edit diberikan");
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["editors"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => {
      toast.success("Hak edit dicabut");
      void queryClient.invalidateQueries({ queryKey: ["editors"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <p className="p-8 text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Khusus pemilik</h1>
          <p className="mt-3 text-muted-foreground">
            Hanya pemilik katalog yang bisa mengatur akses.
          </p>
          <Button asChild variant="secondary" className="mt-6">
            <Link to="/">Kembali ke beranda</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <div>
          <h1 className="font-display text-4xl">Kelola Akses</h1>
          <p className="text-sm text-muted-foreground">
            Orang yang kamu tambahkan bisa menambah dan mengubah judul, sama seperti kamu.
            Pastikan dia sudah mendaftar lebih dulu lewat halaman Masuk.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            grantMutation.mutate(email);
          }}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="editor-email">Email editor</Label>
            <Input
              id="editor-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teman@email.com"
            />
          </div>
          <Button type="submit" disabled={grantMutation.isPending}>
            Beri akses
          </Button>
        </form>

        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {(data ?? []).map((row) => (
            <div key={row.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate">{row.displayName ?? row.email}</p>
                <p className="text-xs text-muted-foreground">
                  {row.email} · {row.role === "admin" ? "Pemilik" : "Editor"}
                </p>
              </div>
              {row.role === "editor" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => revokeMutation.mutate(row.id)}
                >
                  Cabut
                </Button>
              )}
            </div>
          ))}
          {(data ?? []).length === 0 && (
            <p className="p-8 text-center text-muted-foreground">Belum ada data akses.</p>
          )}
        </div>
      </main>
    </div>
  );
}
