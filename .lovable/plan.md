# Netflix Watchlist Pribadi

Website katalog film & series Netflix yang kamu tonton, dengan poster, rating pribadi, dan trailer — semua bisa ditambah langsung dari website tanpa ngoding.

## Tampilan

Gaya sinematik gelap (bukan tiruan Netflix persis): latar hitam pekat kebiruan, aksen merah-marun hangat, tipografi tegas untuk judul dan teks bersih untuk isi.

- **Beranda**: hero besar berisi tontonan favorit teratas (poster besar, blur backdrop, tombol "Putar Trailer"), lalu baris-baris koleksi yang bisa digeser horizontal: Rating Tertinggi, Baru Ditambahkan, per genre.
- **Kartu judul**: poster potret, hover memunculkan judul, tahun, dan badge rating (mis. 9.95) berwarna sesuai skor.
- **Halaman detail**: backdrop poster, sinopsis, rating besar, catatan pribadi, genre, status tontonan, dan trailer yang diputar di halaman.
- **Trailer**: mendukung file video yang di-upload maupun link YouTube. Klik trailer membuka pemutar modal.

## Fitur

1. **Tambah judul dari website** — form dengan: judul, tahun, tipe (film/series), rating 0–10 (satu desimal), genre, sinopsis, catatan pribadi, status (ditonton / sedang ditonton / mau ditonton), upload poster, dan trailer (upload video atau tempel link YouTube).
2. **Edit & hapus** judul yang sudah ada.
3. **Pencarian & filter** berdasarkan judul, genre, tipe, status; urutkan berdasarkan rating, tahun, atau terbaru.
4. **Statistik** ringkas: total tontonan, rata-rata rating, genre favorit, judul rating tertinggi.
5. **Favorit / pin** untuk menentukan apa yang muncul di hero.
6. **Login editor** — kamu dan 1 orang lain (dua akun) bisa menambah/mengedit/menghapus; pengunjung lain hanya melihat.
7. **Halaman kelola akses** — kamu bisa memberi (atau mencabut) hak editor ke akun kedua lewat email, tanpa ngoding.

## Data awal

Entri "Can This Love Be Translated?" akan diisi lebih dulu dengan rating 9.95/10, poster yang kamu upload, dan trailer video yang kamu lampirkan.

## Catatan teknis

- Proyek Lovable memakai React + TypeScript yang dikompilasi jadi HTML, CSS, dan JavaScript biasa di browser — hasil akhirnya tetap web standar. Kodenya ditulis sesederhana mungkin, tanpa library tambahan yang tidak perlu.

- Lovable Cloud diaktifkan untuk database, autentikasi, dan penyimpanan file.
- Tabel `titles` (judul, tahun, tipe, rating, genre array, sinopsis, catatan, status, favorit, poster_url, trailer_url, trailer_type) dengan RLS: publik boleh baca, hanya user terautentikasi (pemilik, lewat tabel `user_roles`) yang boleh tulis.
- Dua storage bucket publik: `posters` dan `trailers`.
- Poster dan trailer yang kamu lampirkan diunggah sebagai aset CDN dan dipakai untuk baris seed.
- Rute: `/` (beranda), `/title/$id` (detail), `/manage` (tambah/edit, terproteksi), `/auth` (login).
