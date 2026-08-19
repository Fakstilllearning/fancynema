import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { TrailerPlayer } from "@/components/TrailerPlayer";
import { Button } from "@/components/ui/button";
import { fetchTitle, kindLabel, statusLabel, ratingColor } from "@/lib/catalog";

export const Route = createFileRoute("/title/$id")({
  head: () => ({
    meta: [
      { title: "Detail Tontonan — Tontonan" },
      {
        name: "description",
        content: "Detail film atau series: rating pribadi, sinopsis, catatan, dan trailer.",
      },
      { property: "og:type", content: "video.other" },
      { property: "og:title", content: "Detail Tontonan — Tontonan" },
      {
        property: "og:description",
        content: "Rating pribadi, sinopsis, catatan, dan trailer.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TitleDetail,
});

function TitleDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["title", id],
    queryFn: () => fetchTitle(id),
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {isLoading && <p className="text-muted-foreground">Memuat...</p>}
        {!isLoading && !data && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-2xl">Judul tidak ditemukan</p>
            <Button asChild variant="secondary" className="mt-4">
              <Link to="/">Kembali ke beranda</Link>
            </Button>
          </div>
        )}

        {data && (
          <article className="space-y-10">
            <header className="grid gap-8 md:grid-cols-[200px_1fr]">
              {data.poster_url && (
                <img
                  src={data.poster_url}
                  alt={`Poster ${data.name}`}
                  className="aspect-2/3 w-40 rounded-xl object-cover shadow-2xl ring-1 ring-border md:w-full"
                />
              )}
              <div>
                <h1 className="text-balance font-display text-5xl leading-[0.95]">{data.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {data.rating !== null && (
                    <span className={`font-display text-3xl ${ratingColor(data.rating)}`}>
                      {Number(data.rating).toFixed(2)}/10
                    </span>
                  )}
                  <span>{kindLabel(data.kind)}</span>
                  {data.year && <span>{data.year}</span>}
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                    {statusLabel(data.status)}
                  </span>
                </div>
                {data.genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {data.synopsis && (
                  <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
                    {data.synopsis}
                  </p>
                )}
              </div>
            </header>

            {data.trailer_url && (
              <section>
                <h2 className="mb-4 text-2xl">Trailer</h2>
                <TrailerPlayer
                  url={data.trailer_url}
                  type={data.trailer_type}
                  title={data.name}
                />
              </section>
            )}

            {data.notes && (
              <section>
                <h2 className="mb-3 text-2xl">Catatan Pribadi</h2>
                <p className="whitespace-pre-line rounded-xl border border-border bg-surface p-6 leading-relaxed">
                  {data.notes}
                </p>
              </section>
            )}

            <Button asChild variant="secondary">
              <Link to="/">Kembali ke koleksi</Link>
            </Button>
          </article>
        )}
      </main>
    </div>
  );
}
