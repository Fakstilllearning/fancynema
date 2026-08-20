import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { TitleCard } from "@/components/TitleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchTitles, kindLabel, statusLabel, ratingColor, type Title } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fancynema - Katalog Film & Series Pribadi" },
      {
        name: "description",
        content:
          "Koleksi film dan series Netflix favorit lengkap dengan penilaian pribadi, poster, dan video trailer.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Fancynema - Katalog Film & Series Pribadi" },
      {
        property: "og:description",
        content: "Film & series favorit dengan rating pribadi, poster, dan trailer.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ["titles"], queryFn: fetchTitles });
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "film" | "series">("all");

  const titles = data ?? [];
  const hero = useMemo(
    () => titles.find((t) => t.is_favorite) ?? titles[0] ?? null,
    [titles],
  );

  const filtered = titles.filter((t) => {
    const okKind = kind === "all" || t.kind === kind;
    const q = search.trim().toLowerCase();
    const okSearch =
      q === "" ||
      t.name.toLowerCase().includes(q) ||
      t.genres.some((g) => g.toLowerCase().includes(q));
    return okKind && okSearch;
  });

  const favorites = filtered.filter((t) => t.is_favorite);
  const topRated = filtered.filter((t) => (t.rating ?? 0) >= 9);
  const byStatus = (status: string) => filtered.filter((t) => t.status === status);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {hero && <Hero title={hero} />}

      <main className="mx-auto max-w-7xl space-y-12 px-4 pb-24 pt-12 sm:px-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Cari judul atau genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex gap-2">
            {(["all", "film", "series"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={kind === option ? "default" : "secondary"}
                onClick={() => setKind(option)}
              >
                {option === "all" ? "Semua" : kindLabel(option)}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground sm:ml-auto">
            {filtered.length} judul dalam koleksi
          </p>
        </section>

        {isLoading && <p className="text-muted-foreground">Memuat koleksi...</p>}

        {!isLoading && titles.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-2xl">Koleksi masih kosong</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Masuk sebagai pemilik lalu tambahkan film atau series pertama kamu.
            </p>
          </div>
        )}

        {isFiltering ? (
          filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-2xl">Tidak ada hasil</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Coba kata kunci atau kategori lain.
              </p>
            </div>
          ) : (
            <section>
              <h2 className="mb-4 text-2xl">Hasil Pencarian</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {filtered.map((item) => (
                  <TitleCard key={item.id} title={item} />
                ))}
              </div>
            </section>
          )
        ) : (
          <>
            <Row title="Favorit" items={favorites} />
            <Row title="Rating Tertinggi" items={topRated} />
            <Row title={statusLabel("watching")} items={byStatus("watching")} />
            <Row title={statusLabel("watched")} items={byStatus("watched")} />
            <Row title={statusLabel("watchlist")} items={byStatus("watchlist")} />
          </>
        )}
      </main>
    </div>
  );
}

function Hero({ title }: { title: Title }) {
  return (
    <section className="relative isolate overflow-hidden">
      {title.poster_url && (
        <img
          src={title.poster_url}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[220px_1fr] md:items-end md:py-24">
        {title.poster_url && (
          <img
            src={title.poster_url}
            alt={`Poster ${title.name}`}
            className="aspect-2/3 w-40 rounded-xl object-cover shadow-2xl ring-1 ring-border md:w-full"
          />
        )}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Sorotan Utama</p>
          <h1 className="mt-3 text-balance font-display text-5xl leading-[0.95] text-glow sm:text-7xl">
            {title.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {title.rating !== null && (
              <span className={`font-display text-2xl ${ratingColor(title.rating)}`}>
                {Number(title.rating).toFixed(2)}/10
              </span>
            )}
            <span>{kindLabel(title.kind)}</span>
            {title.year && <span>{title.year}</span>}
            {title.genres.slice(0, 3).map((genre) => (
              <span key={genre} className="rounded-full bg-secondary px-3 py-1 text-xs">
                {genre}
              </span>
            ))}
          </div>
          {title.synopsis && (
            <p className="mt-5 max-w-2xl text-pretty text-muted-foreground">{title.synopsis}</p>
          )}
          <Button asChild className="mt-7">
            <Link to="/title/$id" params={{ id: title.id }}>
              Lihat detail & trailer
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Row({ title, items }: { title: string; items: Title[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 text-2xl">{title}</h2>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((item) => (
          <TitleCard key={item.id} title={item} />
        ))}
      </div>
    </section>
  );
}
