/**
 * =============================================================
 *  GESTURE.JS
 *  Deteksi gesture "Pinch" (Grab) dari 21 landmark tangan MediaPipe.
 *
 *  Cara kerja:
 *  - Ambil landmark #4 (Thumb Tip) dan landmark #8 (Index Finger Tip).
 *  - Hitung jarak Euclidean di antara keduanya (koordinat ternormalisasi 0..1).
 *  - Jika jarak < PINCH_THRESHOLD  -> status "grab"
 *  - Jika jarak >= PINCH_THRESHOLD -> status "release"
 *
 *  Sedikit hysteresis diterapkan (threshold masuk lebih kecil dari threshold
 *  keluar) supaya status tidak "flicker" saat jarak berada persis di batas.
 * =============================================================
 */

// Index landmark MediaPipe Hands yang relevan
const LANDMARK = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
};

class GestureDetector {
  /**
   * @param {object} options
   * @param {number} options.pinchEnterThreshold - jarak (normalized) untuk MULAI grab
   * @param {number} options.pinchExitThreshold  - jarak (normalized) untuk BERHENTI grab
   */
  constructor(options = {}) {
    this.pinchEnterThreshold = options.pinchEnterThreshold ?? 0.055;
    this.pinchExitThreshold = options.pinchExitThreshold ?? 0.075;

    // Status per-tangan, key = handIndex (0 atau 1)
    this.handStates = new Map();
  }

  /**
   * Menganalisa satu set landmark tangan dan mengembalikan info gesture.
   * @param {Array<{x:number,y:number,z:number}>} landmarks - 21 titik landmark (normalized 0..1)
   * @param {number} handIndex - indeks tangan (0 = tangan pertama, 1 = tangan kedua)
   * @returns {{isGrab:boolean, pinchDistance:number, cursor:{x:number,y:number}}}
   */
  analyze(landmarks, handIndex = 0) {
    const thumbTip = landmarks[LANDMARK.THUMB_TIP];
    const indexTip = landmarks[LANDMARK.INDEX_TIP];

    const pinchDistance = Utils.distance(thumbTip, indexTip);

    const prevState = this.handStates.get(handIndex) || { isGrab: false };

    // Hysteresis: pakai threshold berbeda tergantung status sebelumnya
    let isGrab;
    if (prevState.isGrab) {
      isGrab = pinchDistance < this.pinchExitThreshold;
    } else {
      isGrab = pinchDistance < this.pinchEnterThreshold;
    }

    // Titik cursor = titik tengah antara thumb tip & index tip
    const cursor = {
      x: (thumbTip.x + indexTip.x) / 2,
      y: (thumbTip.y + indexTip.y) / 2,
    };

    const state = { isGrab, pinchDistance, cursor };
    this.handStates.set(handIndex, state);
    return state;
  }

  /**
   * Reset seluruh state (dipanggil saat tangan hilang dari frame).
   */
  reset() {
    this.handStates.clear();
  }
}
