import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  createTitle,
  updateTitle,
  uploadMedia,
  type Title,
  type TitleInput,
  type TitleKind,
  type TrailerType,
  type WatchStatus,
} from "@/lib/catalog";

export function TitleForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Title | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [kind, setKind] = useState<TitleKind>((initial?.kind as TitleKind) ?? "series");
  const [rating, setRating] = useState(initial?.rating !== null && initial ? String(initial.rating) : "");
  const [genres, setGenres] = useState((initial?.genres ?? []).join(", "));
  const [synopsis, setSynopsis] = useState(initial?.synopsis ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [status, setStatus] = useState<WatchStatus>((initial?.status as WatchStatus) ?? "watched");
  const [isFavorite, setIsFavorite] = useState(initial?.is_favorite ?? false);
  const [posterUrl, setPosterUrl] = useState(initial?.poster_url ?? "");
  const [trailerUrl, setTrailerUrl] = useState(initial?.trailer_url ?? "");
  const [trailerType, setTrailerType] = useState<TrailerType>(
    (initial?.trailer_type as TrailerType) ?? "youtube",
  );
  const [busy, setBusy] = useState(false);

  const upload = async (bucket: "posters" | "trailers", file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(bucket, file);
      if (bucket === "posters") setPosterUrl(url);
      else {
        setTrailerUrl(url);
        setTrailerType("file");
      }
      toast.success("File berhasil diunggah");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah file");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: TitleInput = {
      name: name.trim(),
      year: year ? Number(year) : null,
      kind,
      rating: rating ? Number(rating) : null,
      genres: genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      synopsis: synopsis.trim(),
      notes: notes.trim(),
      status,
      is_favorite: isFavorite,
      poster_url: posterUrl.trim() || null,
      trailer_url: trailerUrl.trim() || null,
      trailer_type: trailerType,
    };

    setBusy(true);
    try {
      if (initial) await updateTitle(initial.id, payload);
      else await createTitle(payload);
      toast.success(initial ? "Perubahan disimpan" : "Judul ditambahkan");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border border-border bg-surface p-6"
    >
      <h2 className="text-2xl">{initial ? "Ubah judul" : "Judul baru"}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nama film / series</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Tahun</Label>
          <Input
            id="year"
            type="number"
            min={1900}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Penilaian (0 - 10)</Label>
          <Input
            id="rating"
            type="number"
            step="0.01"
            min={0}
            max={10}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kind">Jenis</Label>
          <select
            id="kind"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as TitleKind)}
          >
            <option value="series">Series</option>
            <option value="film">Film</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as WatchStatus)}
          >
            <option value="watched">Sudah ditonton</option>
            <option value="watching">Sedang ditonton</option>
            <option value="watchlist">Mau ditonton</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="genres">Genre (pisahkan dengan koma)</Label>
          <Input
            id="genres"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            placeholder="Romance, Drama, Komedi"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="synopsis">Sinopsis</Label>
          <Textarea
            id="synopsis"
            rows={3}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Catatan pribadi</Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kenapa kamu suka judul ini?"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="poster">Poster (unggah file atau tempel URL)</Label>
          <Input
            id="poster"
            type="file"
            accept="image/*"
            onChange={(e) => void upload("posters", e.target.files?.[0])}
          />
          <Input
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://..."
          />
          {posterUrl && (
            <img
              src={posterUrl}
              alt="Pratinjau poster"
              className="h-40 w-28 rounded-md object-cover"
            />
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="trailer">Trailer (unggah video atau tempel link YouTube)</Label>
          <Input
            id="trailer"
            type="file"
            accept="video/*"
            onChange={(e) => void upload("trailers", e.target.files?.[0])}
          />
          <Input
            value={trailerUrl}
            onChange={(e) => {
              setTrailerUrl(e.target.value);
              setTrailerType(e.target.value.includes("youtu") ? "youtube" : "file");
            }}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch id="favorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
          <Label htmlFor="favorite">Jadikan favorit (tampil di sorotan utama)</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
          Batal
        </Button>
      </div>
    </form>
  );
}
