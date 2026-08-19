import { supabase } from "@/integrations/supabase/client";

export type TitleKind = "film" | "series";
export type WatchStatus = "watched" | "watching" | "watchlist";
export type TrailerType = "file" | "youtube";

export type Title = {
  id: string;
  name: string;
  year: number | null;
  kind: string;
  rating: number | null;
  genres: string[];
  synopsis: string | null;
  notes: string | null;
  status: string;
  is_favorite: boolean;
  poster_url: string | null;
  trailer_url: string | null;
  trailer_type: string;
  created_at: string;
};

export type TitleInput = {
  name: string;
  year: number | null;
  kind: TitleKind;
  rating: number | null;
  genres: string[];
  synopsis: string;
  notes: string;
  status: WatchStatus;
  is_favorite: boolean;
  poster_url: string | null;
  trailer_url: string | null;
  trailer_type: TrailerType;
};

export const STATUS_LABEL: Record<string, string> = {
  watched: "Sudah ditonton",
  watching: "Sedang ditonton",
  watchlist: "Mau ditonton",
};

export const KIND_LABEL: Record<string, string> = {
  film: "Film",
  series: "Series",
};

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 tahun

export async function fetchTitles(): Promise<Title[]> {
  const { data, error } = await supabase
    .from("titles")
    .select("*")
    .order("rating", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Title[];
}

export async function fetchTitle(id: string): Promise<Title | null> {
  const { data, error } = await supabase.from("titles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Title) ?? null;
}

export async function uploadMedia(bucket: "posters" | "trailers", file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signError) throw signError;
  return data.signedUrl;
}

export async function createTitle(input: TitleInput) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("titles")
    .insert({ ...input, created_by: userData.user?.id ?? null });
  if (error) throw error;
}

export async function updateTitle(id: string, input: TitleInput) {
  const { error } = await supabase.from("titles").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteTitle(id: string) {
  const { error } = await supabase.from("titles").delete().eq("id", id);
  if (error) throw error;
}

export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return match ? match[1] : null;
}

export function ratingColor(rating: number | null): string {
  if (rating === null) return "text-muted-foreground";
  if (rating >= 9) return "text-gold";
  if (rating >= 7.5) return "text-foreground";
  return "text-muted-foreground";
}
