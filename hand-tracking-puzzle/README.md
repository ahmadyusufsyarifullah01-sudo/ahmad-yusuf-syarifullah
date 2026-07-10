# AI Hand Tracking Puzzle

Puzzle interaktif yang dimainkan menggunakan gerakan tangan lewat webcam,
dibangun dengan HTML5, CSS3, JavaScript ES6, **MediaPipe Hands**, dan
HTML5 Canvas — tanpa framework front-end apa pun.

## ▶ Cara Menjalankan

Browser **memblokir akses webcam** pada file yang dibuka langsung
(`file://...`) karena alasan keamanan (secure context). Jalankan proyek ini
lewat local server, misalnya:

```bash
# Opsi 1: Python (sudah terpasang di banyak sistem)
cd ai-hand-tracking-puzzle
python3 -m http.server 8000

# Opsi 2: Node.js
npx serve .
```

Lalu buka **http://localhost:8000** di Chrome/Edge (disarankan) dan izinkan
akses kamera saat diminta.

> Koneksi internet tetap diperlukan karena library MediaPipe (`hands.js`,
> `camera_utils.js`, `drawing_utils.js`) dimuat dari CDN jsDelivr.

## 🎮 Cara Bermain

1. Webcam aktif otomatis — izinkan akses kamera.
2. Tunjukkan tangan ke kamera. 21 titik landmark & garis skeleton akan
   tampil sebagai overlay cyan.
3. **Pinch** (dekatkan ibu jari & telunjuk) di atas potongan puzzle untuk
   men-**Grab**-nya.
4. Geser tangan sambil tetap pinch untuk memindahkan potongan.
5. Lepas pinch (renggangkan jari) di posisi yang benar → potongan otomatis
   **snap**. Jika salah posisi, potongan akan **jatuh** ke tempat ia dilepas.
6. Selesaikan semua potongan untuk melihat layar **Congratulations**
   berisi Score & Time.

Aplikasi mendukung deteksi **hingga 2 tangan sekaligus** — kamu bisa
memindahkan dua potongan puzzle secara bersamaan dengan kedua tangan.

## 🧩 Fitur

- Deteksi tangan real-time (maks. 2 tangan, 21 landmark) via MediaPipe Hands
- Gesture Pinch → Grab / Release dengan hysteresis anti-flicker
- Drag & snap potongan puzzle dengan animasi jatuh saat salah posisi
- Upload gambar sendiri, atau pakai gambar default prosedural
- Pilihan grid 3×3 / 4×4 / 5×5 / 6×6
- Timer, FPS counter, progress bar, jumlah potongan benar
- Kontrol Start / Shuffle / Pause / Resume / Reset / Fullscreen
- Layout 3 kolom responsif: Webcam · Puzzle Board · Preview & Stats
- Modal Congratulations dengan Score, Time, dan tombol Play Again

## 📁 Struktur Folder

```
/index.html      - Struktur halaman & elemen UI
/style.css        - Desain visual bertema "Computer Vision HUD"
/script.js        - Orkestrator utama (state, event, render loop)
/mediapipe.js      - Wrapper MediaPipe Hands + gambar skeleton landmark
/puzzle.js         - Mesin puzzle (slicing, drag, snap, fisika jatuh)
/gesture.js        - Deteksi gesture Pinch (Thumb Tip ↔ Index Tip)
/camera.js         - Aktivasi webcam (WebRTC) & penghitung FPS
/utils.js          - Fungsi bantu umum (distance, format waktu, dll.)
/assets/images     - (opsional) tempat menaruh gambar contoh
```

## 🛠️ Teknologi

| Komponen         | Teknologi                 |
|-------------------|----------------------------|
| Frontend          | HTML5                     |
| Styling           | CSS3                      |
| Logic             | JavaScript ES6            |
| AI Hand Tracking  | MediaPipe Hands           |
| Kamera            | WebRTC (`getUserMedia`)   |
| Canvas            | HTML5 Canvas 2D           |
| Gesture           | Finger Landmark Distance  |
| Puzzle Engine     | Vanilla JavaScript        |

## ⚙️ Kalibrasi Gesture

Threshold pinch diatur di `gesture.js` (nilai normalized 0–1, relatif
terhadap ukuran frame kamera):

```js
pinchEnterThreshold: 0.055  // jarak untuk MULAI grab
pinchExitThreshold:  0.075  // jarak untuk BERHENTI grab (hysteresis)
```

Jika deteksi pinch terasa terlalu sensitif atau kurang sensitif,
sesuaikan kedua nilai ini di konstruktor `GestureDetector`.
