/**
 * =============================================================
 *  UTILS.JS
 *  Kumpulan fungsi bantu (helper) yang dipakai di seluruh modul.
 *  Tidak bergantung pada modul lain -> aman dimuat paling awal.
 * =============================================================
 */

const Utils = (() => {

  /**
   * Menghitung jarak Euclidean 2D antara dua titik.
   * Dipakai untuk mengukur jarak Thumb Tip - Index Tip (deteksi Pinch).
   * @param {{x:number,y:number}} a
   * @param {{x:number,y:number}} b
   * @returns {number}
   */
  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Membatasi nilai agar tetap berada di antara min dan max.
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Interpolasi linear antara a dan b sebesar t (0..1).
   * Dipakai untuk menghaluskan pergerakan cursor tangan (smoothing).
   */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Format detik menjadi string mm:ss untuk tampilan timer.
   * @param {number} totalSeconds
   */
  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /**
   * Mengacak urutan array secara in-place menggunakan algoritma Fisher-Yates.
   * @param {Array} array
   */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Menghasilkan angka acak dalam rentang [min, max).
   */
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Sederhana throttle -> membatasi seberapa sering sebuah fungsi
   * boleh dipanggil (dipakai untuk membatasi update UI berat).
   */
  function throttle(fn, delayMs) {
    let last = 0;
    return (...args) => {
      const now = performance.now();
      if (now - last >= delayMs) {
        last = now;
        fn(...args);
      }
    };
  }

  /**
   * Membuat gambar puzzle default secara prosedural (canvas)
   * apabila pengguna belum mengunggah gambar sendiri.
   * Menghasilkan sebuah HTMLImageElement (via data URL) berisi
   * pemandangan abstrak dengan banyak warna & bentuk yang mudah dibedakan
   * antar potongan puzzle.
   * @returns {Promise<HTMLImageElement>}
   */
  function generateDefaultPuzzleImage() {
    const size = 640;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Langit gradasi
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, '#0f2740');
    sky.addColorStop(0.55, '#1f4f6b');
    sky.addColorStop(1, '#e8935f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, size, size);

    // Matahari
    ctx.beginPath();
    ctx.arc(size * 0.72, size * 0.38, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd27a';
    ctx.fill();

    // Gunung berlapis
    const mountainColors = ['#12384a', '#0d5a5c', '#128a72', '#1cbf8b'];
    mountainColors.forEach((color, i) => {
      const baseY = size * (0.5 + i * 0.12);
      ctx.beginPath();
      ctx.moveTo(0, baseY + 40);
      for (let x = 0; x <= size; x += size / 8) {
        const y = baseY - Math.sin((x / size) * Math.PI * (2 + i) + i) * 40 - i * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Grid HUD dekoratif tipis supaya tiap potongan mudah dibedakan posisinya
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const p = (size / 8) * i;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AI HAND TRACKING PUZZLE', size / 2, size - 30);

    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  }

  /**
   * Membaca file gambar yang diunggah pengguna dan mengembalikan
   * HTMLImageElement yang sudah dimuat.
   * @param {File} file
   * @returns {Promise<HTMLImageElement>}
   */
  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return {
    distance,
    clamp,
    lerp,
    formatTime,
    shuffleArray,
    randomRange,
    throttle,
    generateDefaultPuzzleImage,
    loadImageFromFile
  };
})();
