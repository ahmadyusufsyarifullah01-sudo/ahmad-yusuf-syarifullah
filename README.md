# Sistem Antrian Puskesmas — Hospital Information System (HIS)

Website antrian pasien premium, hasil transformasi dari program C++ **Sistem Antrian Puskesmas** menjadi aplikasi berbasis web dengan tampilan setara aplikasi rumah sakit sungguhan (terinspirasi Halodoc, Siloam, Alodokter, BPJS Mobile).

File utama: **`puskesmas-his.jsx`** — komponen React satu-file, siap dijalankan sebagai artifact atau diintegrasikan ke proyek React/Vite/Next.js.

---

## 1. Ringkasan Fitur

| Modul | Deskripsi |
|---|---|
| **Login** | Halaman login glassmorphism dengan background bertema medis. Kredensial demo: `admin` / `12345`. |
| **Dashboard** | 8 kartu statistik dengan animasi counter (Pasien Hari Ini, Menunggu, Dipanggil, Selesai, Emergency, Lansia, Antrian Aktif, Total Riwayat), daftar antrian berikutnya, dan pie chart komposisi kategori. Semua nilai **mulai dari 0** — tidak ada data dummy. |
| **Pendaftaran** | Form pasien baru (nama, No RM, umur, keluhan, status gawat darurat) dengan preview kategori/prioritas otomatis dan validasi No RM aktif. |
| **Antrian** | Tabel antrian real-time, terurut otomatis berdasarkan prioritas, dengan badge warna, filter kategori, pencarian, kolom **Jam Masuk**, dan tombol Panggil (hanya aktif untuk antrian terdepan). |
| **Modal Panggil Pasien** | Animasi soundbar + teks pengumuman ("Nomor antrian 001 dipersilakan menuju Poli"), lalu memindahkan status pasien ke Selesai. |
| **Riwayat** | Seluruh pasien yang telah selesai dilayani, tersimpan otomatis, lengkap dengan jam masuk & jam selesai. |
| **Statistik** | Pie chart kategori pasien, bar chart pasien per hari, line chart tren jumlah antrian per jam. |
| **Penjelasan Algoritma** | Walkthrough interaktif 9 langkah logika C++: struct Pasien, array antrian, pengecekan No RM, penentuan prioritas, bubble sort, proses panggil pasien, status pasien, penyimpanan & pembacaan file — masing-masing dengan ilustrasi alur. |
| **Reset Data** | Menu di sidebar & halaman Pengaturan untuk mengosongkan seluruh antrian dan riwayat kembali ke 0, dengan modal konfirmasi. |
| **Pengaturan** | Ringkasan sesi serta placeholder untuk backup/restore JSON dan ekspor PDF/Excel. |

---

## 2. Pemetaan Logika C++ → Web

Setiap fungsi pada program C++ asli memiliki padanan langsung di kode React, sehingga perilaku aplikasi identik:

| Fungsi C++ | Padanan di `puskesmas-his.jsx` | Keterangan |
|---|---|---|
| `struct Pasien` | Objek JS dengan field yang sama (`nama`, `noRM`, `umur`, `prioritas`, `kategori`, `keluhan`, `status`) | Ditambah `id`, `noAntrian`, `waktuDaftar`, `waktuSelesai` untuk kebutuhan UI. |
| `cekPrioritasKhusus()` | `classify()` | Emergency → prioritas 1, umur ≥ 60 → prioritas 2 (Lansia), selain itu → prioritas 3 (Biasa). |
| `urutkanAntrian()` | `bubbleSortByPrioritas()` | Implementasi bubble sort yang sama persis, dipanggil setiap kali antrian berubah. |
| `cekNoRMAktif()` | `isNoRMActive()` | Menolak pendaftaran bila No RM yang sama masih berstatus Menunggu → memunculkan modal peringatan "No RM masih aktif". |
| `simpanData()` / `muatData()` | Disimulasikan lewat React state (lihat bagian **Batasan** di bawah) | Placeholder backup/restore JSON tersedia di halaman Pengaturan sebagai titik integrasi. |
| `panggilPasien()` | `handleCall()` | Mengambil pasien terdepan, mengubah status menjadi Selesai, menggeser sisa antrian, memindahkan data ke Riwayat. |

---

## 3. Arsitektur Kode

Karena aplikasi didistribusikan sebagai satu file artifact, "pemisahan folder" (components / pages / services / hooks / utils) direpresentasikan sebagai **blok berkomentar** di dalam file, dengan urutan:

```
1. DESIGN TOKENS      → palet warna, tipografi, shadow, animasi (CSS variables)
2. UTILS / LOGIC       → classify(), bubbleSortByPrioritas(), isNoRMActive(), formatter tanggal
3. SEED DATA           → seedQueue() / seedHistory() (saat ini mengembalikan array kosong)
4. HOOKS               → useCountUp(), useClock()
5. TOAST SYSTEM        → notifikasi aksi
6. LOGIN PAGE
7. SIDEBAR / TOPBAR
8. DASHBOARD
9. PENDAFTARAN
10. ANTRIAN + CALL MODAL
11. RIWAYAT
12. STATISTIK
13. PENJELASAN ALGORITMA
14. PENGATURAN + RESET MODAL
15. APP SHELL (routing state, komposisi seluruh halaman)
```

Saat dipindahkan ke proyek multi-file (Vite/Next.js), setiap blok di atas bisa langsung dipecah menjadi file sendiri sesuai namanya tanpa mengubah logikanya.

**Stack:** React (hooks), Recharts (pie/bar/line chart), Lucide React (ikon), CSS murni via `<style>` tag untuk token warna (bukan Tailwind arbitrary color, agar konsisten di semua environment).

---

## 4. Palet Warna & Tipografi

```
Primary    #0F4C81      Secondary  #2E8BC0      Accent   #00A6A6
Success    #4CAF50      Danger     #E53935       Warning  #FFB300
Background #F5F9FC      Card       #FFFFFF
```

Font: **Poppins** (display/heading) + **Inter** (body/UI).

---

## 5. Cara Menjalankan

### Sebagai artifact (Claude.ai)
File langsung dapat dirender di panel artifact — tidak perlu instalasi apa pun.

### Sebagai proyek React mandiri
```bash
npm create vite@latest puskesmas-his -- --template react
cd puskesmas-his
npm install recharts lucide-react
# salin isi puskesmas-his.jsx ke src/App.jsx
npm run dev
```
Pastikan font Poppins & Inter dimuat (mis. via Google Fonts di `index.html`) agar tipografi tampil sesuai desain.

---

## 6. Batasan Saat Ini & Rencana Pengembangan

- **Penyimpanan data**: karena artifact tidak diperbolehkan mengakses `localStorage`/`sessionStorage`, data disimpan di React state (memori sesi). Data akan kembali kosong setiap kali halaman dimuat ulang. Untuk produksi, ganti bagian state (`queue`, `history` di `App`) dengan pemanggilan API ke backend (Node/Express, atau langsung port fungsi `simpanData()`/`muatData()` C++ ke endpoint file/database) — komponen UI tidak perlu diubah.
- **Export PDF/Excel & backup/restore JSON**: tombolnya sudah ada di halaman Pengaturan namun baru memicu notifikasi placeholder, belum benar-benar generate file. Siap dikembangkan lebih lanjut bila diperlukan.
- **Dark mode**: belum diimplementasikan; token warna sudah berbasis CSS variable sehingga penambahan tema gelap relatif mudah dilakukan di kemudian hari.
- **Activity log admin**: belum ada, bisa ditambahkan sebagai halaman baru mengikuti pola yang sama dengan Riwayat.

---

## 7. Kredensial Demo

```
Username : admin
Password : 12345
```
