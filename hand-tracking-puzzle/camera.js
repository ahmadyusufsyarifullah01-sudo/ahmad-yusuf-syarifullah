/**
 * =============================================================
 *  CAMERA.JS
 *  Bertanggung jawab atas aktivasi webcam (WebRTC) dan penghitung FPS.
 *  Modul ini murni berurusan dengan <video> element, tidak tahu
 *  apa-apa tentang MediaPipe maupun puzzle.
 * =============================================================
 */

class CameraManager {
  /**
   * @param {HTMLVideoElement} videoElement - elemen <video> tempat stream webcam ditampilkan
   */
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.stream = null;

    // --- FPS tracking ---
    this._frameTimestamps = [];
    this.currentFPS = 0;
  }

  /**
   * Meminta izin & mengaktifkan webcam secara otomatis.
   * @returns {Promise<void>}
   */
  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser ini tidak mendukung akses webcam (getUserMedia).');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    });

    this.videoElement.srcObject = this.stream;

    // Tunggu metadata video siap agar width/height valid
    await new Promise((resolve) => {
      this.videoElement.onloadedmetadata = () => {
        this.videoElement.play();
        resolve();
      };
    });
  }

  /**
   * Menghentikan seluruh track webcam (melepas kamera).
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  /**
   * Dipanggil setiap frame diproses untuk menghitung FPS berjalan
   * (rata-rata bergerak dari 30 frame terakhir).
   */
  tick() {
    const now = performance.now();
    this._frameTimestamps.push(now);
    // Buang timestamp yang lebih tua dari 1 detik
    while (this._frameTimestamps.length && now - this._frameTimestamps[0] > 1000) {
      this._frameTimestamps.shift();
    }
    this.currentFPS = this._frameTimestamps.length;
    return this.currentFPS;
  }

  get videoWidth() {
    return this.videoElement.videoWidth || 640;
  }

  get videoHeight() {
    return this.videoElement.videoHeight || 480;
  }
}
