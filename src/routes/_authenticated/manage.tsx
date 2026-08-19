import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { TitleForm } from "@/components/TitleForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteTitle,
  fetchTitles,
  kindLabel,
  statusLabel,
  type Title,
} from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/manage")({
  head: () => ({
    meta: [
      { title: "Kelola Koleksi — Tontonan" },
      {
        name: "description",
        content: "Tambah, ubah, dan hapus film atau series beserta poster dan trailernya.",
      },
      { property: "og:title", content: "Kelola Koleksi — Tontonan" },
      {
        property: "og:description",
        content: "Kelola katalog film & series pribadi langsung dari website.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ManagePage,
});

function ManagePage() {
  const { canEdit, loading } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["titles"], queryFn: fetchTitles });
  const [editing, setEditing] = useState<Title | null>(null);
  const [showForm, setShowForm] = useState(false);

  const removeMutation = useMutation({
    mutationFn: deleteTitle,
    onSuccess: () => {
      toast.success("Judul dihapus");
      void queryClient.invalidateQueries({ queryKey: ["titles"] });
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

  if (!canEdit) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Belum punya akses edit</h1>
          <p className="mt-3 text-muted-foreground">
            Akun kamu sudah masuk, tetapi belum diberi hak sebagai editor. Minta pemilik katalog
            menambahkan email kamu di halaman Akses.
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
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="font-display text-4xl">Kelola Koleksi</h1>
            <p className="text-sm text-muted-foreground">
              Tambah judul baru lengkap dengan poster dan trailer.
            </p>
          </div>
          <Button
            className="ml-auto"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Tambah judul
          </Button>
        </div>

        {showForm && (
          <TitleForm
            initial={editing}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              void queryClient.invalidateQueries({ queryKey: ["titles"] });
            }}
          />
        )}

        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {(data ?? []).map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              {item.poster_url ? (
                <img
                  src={item.poster_url}
                  alt=""
                  className="h-20 w-14 rounded-md object-cover"
                />
              ) : (
                <div className="h-20 w-14 rounded-md bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {kindLabel(item.kind)} · {statusLabel(item.status)}
                  {item.rating !== null && ` · ${Number(item.rating).toFixed(2)}/10`}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditing(item);
                  setShowForm(true);
                }}
              >
                Ubah
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Hapus "${item.name}"?`)) removeMutation.mutate(item.id);
                }}
              >
                Hapus
              </Button>
            </div>
          ))}
          {(data ?? []).length === 0 && (
            <p className="p-8 text-center text-muted-foreground">Belum ada judul.</p>
          )}
        </div>
      </main>
    </div>
  );
}
