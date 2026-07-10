/**
 * =============================================================
 *  MEDIAPIPE.JS
 *  Membungkus library @mediapipe/hands agar mudah dipakai oleh script.js.
 *  Tugas modul ini:
 *   - Inisialisasi model MediaPipe Hands (maks. 2 tangan, 21 landmark).
 *   - Menjalankan loop deteksi menggunakan CameraManager yang sudah ada.
 *   - Menggambar landmark + garis skeleton ke canvas overlay.
 *
 *  Library MediaPipe dimuat via CDN pada index.html:
 *   - hands.js
 *   - camera_utils.js
 *   - drawing_utils.js
 * =============================================================
 */

class HandTrackingEngine {
  /**
   * @param {object} config
   * @param {HTMLVideoElement} config.videoElement
   * @param {HTMLCanvasElement} config.overlayCanvas - canvas untuk menggambar skeleton di atas video
   * @param {function(Array):void} config.onResults - callback(hands) setiap frame terdeteksi
   */
  constructor({ videoElement, overlayCanvas, onResults }) {
    this.videoElement = videoElement;
    this.overlayCanvas = overlayCanvas;
    this.overlayCtx = overlayCanvas.getContext('2d');
    this.onResultsCallback = onResults;

    this.hands = null;
    this.mpCamera = null; // instance dari mediapipe camera_utils.Camera
  }

  /**
   * Menyiapkan model MediaPipe Hands.
   */
  init() {
    // eslint-disable-next-line no-undef
    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 2,              // Deteksi maksimal DUA tangan
      modelComplexity: 1,          // 0 = ringan, 1 = akurat (seimbang)
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });

    this.hands.onResults((results) => this._handleResults(results));
  }

  /**
   * Menjalankan kamera MediaPipe yang secara otomatis memanggil
   * this.hands.send() setiap frame video baru tersedia.
   */
  start() {
    // eslint-disable-next-line no-undef
    this.mpCamera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: this.videoElement });
      },
      width: 640,
      height: 480,
    });
    this.mpCamera.start();
  }

  stop() {
    if (this.mpCamera) {
      this.mpCamera.stop();
    }
  }

  /**
   * Handler internal setiap MediaPipe menghasilkan prediksi baru.
   * Menggambar landmark & skeleton, lalu meneruskan data mentah
   * ke callback aplikasi utama (script.js) untuk logika gesture/puzzle.
   */
  _handleResults(results) {
    const ctx = this.overlayCtx;
    const canvas = this.overlayCanvas;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hands = results.multiHandLandmarks || [];
    const handedness = results.multiHandedness || [];

    hands.forEach((landmarks, i) => {
      const label = handedness[i]?.label || `Hand ${i + 1}`;
      this._drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
      this._drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
      this._drawLabel(ctx, landmarks, label, canvas.width, canvas.height);
    });

    ctx.restore();

    // Teruskan hasil mentah ke aplikasi utama
    if (this.onResultsCallback) {
      this.onResultsCallback(hands);
    }
  }

  /**
   * Menggambar 21 titik landmark sebagai lingkaran kecil.
   */
  _drawLandmarks(ctx, landmarks, w, h) {
    landmarks.forEach((lm, idx) => {
      const x = lm.x * w;
      const y = lm.y * h;

      // Titik ujung jari (thumb tip & index tip) ditonjolkan
      const isFingertip = idx === LANDMARK.THUMB_TIP || idx === LANDMARK.INDEX_TIP;

      ctx.beginPath();
      ctx.arc(x, y, isFingertip ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isFingertip ? '#ff6b4a' : '#00e5c7';
      ctx.shadowColor = isFingertip ? '#ff6b4a' : '#00e5c7';
      ctx.shadowBlur = 8;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  /**
   * Menggambar garis penghubung antar landmark (skeleton tangan).
   */
  _drawSkeleton(ctx, landmarks, w, h) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(0, 229, 199, 0.85)';

    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      ctx.beginPath();
      ctx.moveTo(start.x * w, start.y * h);
      ctx.lineTo(end.x * w, end.y * h);
      ctx.stroke();
    });
  }

  /**
   * Menuliskan label "Left"/"Right" dekat pergelangan tangan.
   */
  _drawLabel(ctx, landmarks, label, w, h) {
    const wrist = landmarks[LANDMARK.WRIST];
    ctx.font = '13px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#e8edf2';
    ctx.fillText(label, wrist.x * w - 14, wrist.y * h + 22);
  }
}

/**
 * Daftar pasangan index landmark yang membentuk "tulang" tangan.
 * Berdasarkan topologi resmi 21-titik MediaPipe Hands.
 */
const HAND_CONNECTIONS = [
  // Ibu jari
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Telunjuk
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Jari tengah
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Jari manis
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Kelingking
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Telapak tangan
  [0, 17],
];
