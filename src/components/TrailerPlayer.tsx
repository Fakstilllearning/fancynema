import { youtubeId } from "@/lib/catalog";

export function TrailerPlayer({
  url,
  type,
  title,
}: {
  url: string;
  type: string;
  title: string;
}) {
  const ytId = type === "youtube" ? youtubeId(url) : null;

  if (ytId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${ytId}`}
          title={`Trailer ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      className="aspect-video w-full rounded-xl bg-black"
      src={url}
      controls
      playsInline
      preload="metadata"
    />
  );
}
