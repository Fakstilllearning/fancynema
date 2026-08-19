import { Link } from "@tanstack/react-router";
import { KIND_LABEL, ratingColor, type Title } from "@/lib/catalog";

export function TitleCard({ title }: { title: Title }) {
  return (
    <Link
      to="/title/$id"
      params={{ id: title.id }}
      className="group relative block w-40 shrink-0 sm:w-48"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface ring-1 ring-border transition-transform duration-300 group-hover:-translate-y-1 group-hover:ring-primary/60">
        {title.poster_url ? (
          <img
            src={title.poster_url}
            alt={`Poster ${title.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center font-display text-xl text-muted-foreground">
            {title.name}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-3 pt-10">
          <p className="truncate font-display text-lg leading-tight">{title.name}</p>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>{KIND_LABEL[title.kind] ?? title.kind}</span>
            {title.year && <span>{title.year}</span>}
          </p>
        </div>
        {title.rating !== null && (
          <span
            className={`absolute right-2 top-2 rounded-md bg-background/85 px-2 py-1 font-display text-base leading-none backdrop-blur ${ratingColor(title.rating)}`}
          >
            {Number(title.rating).toFixed(2)}
          </span>
        )}
      </div>
    </Link>
  );
}
