/**
 * =============================================================
 *  PUZZLE.JS
 *  Mesin puzzle: memotong gambar menjadi grid NxN, mengatur posisi
 *  tiap potongan, deteksi drag/snap, dan animasi "jatuh" saat dilepas
 *  di posisi yang salah.
 *
 *  Sistem koordinat: semua posisi piece disimpan dalam koordinat
 *  BOARD CANVAS (piksel internal canvas, bukan CSS/layar).
 * =============================================================
 */

const GRAVITY = 2600;        // percepatan jatuh (px/s^2) saat piece dilepas salah posisi
const FALL_TIME_LIMIT = 0.32; // durasi maksimum animasi jatuh (detik)
const SNAP_THRESHOLD_RATIO = 0.35; // toleransi snap = 35% dari ukuran piece

class PuzzlePiece {
  constructor({ row, col, size, sx, sy, sw, sh, targetX, targetY }) {
    this.row = row;
    this.col = col;
    this.size = size;

    // Koordinat sumber pada gambar asli (untuk drawImage)
    this.sx = sx; this.sy = sy; this.sw = sw; this.sh = sh;

    // Posisi target (benar)
    this.targetX = targetX;
    this.targetY = targetY;

    // Posisi saat ini (akan diacak oleh shuffle)
    this.x = targetX;
    this.y = targetY;

    this.locked = false;      // true jika sudah terpasang benar (tidak bisa digeser lagi)
    this.falling = false;     // sedang animasi jatuh
    this.vy = 0;
    this.fallTimer = 0;

    // Offset drag: jarak antara titik pegang (cursor) dan pojok kiri-atas piece,
    // supaya piece tidak "melompat" saat pertama kali di-grab.
    this.grabOffsetX = 0;
    this.grabOffsetY = 0;
  }

  get centerX() { return this.x + this.size / 2; }
  get centerY() { return this.y + this.size / 2; }
}

class PuzzleEngine {
  /**
   * @param {number} boardSize - ukuran board dalam piksel canvas (persegi)
   */
  constructor(boardSize = 520) {
    this.boardSize = boardSize;
    this.gridSize = 3;      // default 3x3
    this.pieces = [];
    this.sourceImage = null;
    this.correctCount = 0;

    // Mendukung hingga 2 tangan menggrab 2 potongan secara bersamaan.
    // key = handIndex (0 atau 1), value = PuzzlePiece
    this.heldPieces = new Map();
  }

  /**
   * Memotong gambar (sudah di-crop menjadi persegi/"cover fit") menjadi
   * gridSize x gridSize potongan dan membangun array pieces baru.
   * @param {HTMLImageElement} image
   * @param {number} gridSize - 3, 4, 5, atau 6
   */
  loadImage(image, gridSize) {
    this.sourceImage = image;
    this.gridSize = gridSize;
    this.pieces = [];
    this.correctCount = 0;
    this.heldPieces.clear();

    // Crop gambar menjadi persegi (cover-fit) agar tiap potongan proporsional
    const minSide = Math.min(image.naturalWidth, image.naturalHeight);
    const offsetX = (image.naturalWidth - minSide) / 2;
    const offsetY = (image.naturalHeight - minSide) / 2;

    const pieceSize = this.boardSize / gridSize;
    const srcPieceSize = minSide / gridSize;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const targetX = col * pieceSize;
        const targetY = row * pieceSize;

        this.pieces.push(new PuzzlePiece({
          row, col,
          size: pieceSize,
          sx: offsetX + col * srcPieceSize,
          sy: offsetY + row * srcPieceSize,
          sw: srcPieceSize,
          sh: srcPieceSize,
          targetX,
          targetY,
        }));
      }
    }
  }

  /**
   * Mengacak posisi seluruh potongan puzzle di dalam area board.
   * Semua status "locked"/"falling" direset.
   */
  shuffle() {
    const size = this.pieces[0]?.size ?? 0;
    const maxPos = this.boardSize - size;

    this.pieces.forEach((piece) => {
      piece.x = Utils.randomRange(0, maxPos);
      piece.y = Utils.randomRange(0, maxPos);
      piece.locked = false;
      piece.falling = false;
      piece.vy = 0;
    });

    // Acak urutan render juga supaya tumpukan (z-order) bervariasi
    Utils.shuffleArray(this.pieces);

    this.correctCount = 0;
    this.heldPieces.clear();
  }

  /**
   * Mengembalikan seluruh potongan ke posisi benarnya (tanpa dikunci).
   * Dipakai oleh tombol Reset.
   */
  resetPositions() {
    this.pieces.forEach((piece) => {
      piece.x = piece.targetX;
      piece.y = piece.targetY;
      piece.locked = false;
      piece.falling = false;
      piece.vy = 0;
    });
    this.correctCount = 0;
    this.heldPieces.clear();
  }

  /**
   * Mencari potongan (belum terkunci) di bawah titik (x,y) tertentu,
   * dimulai dari yang paling atas (akhir array = paling depan).
   * @returns {PuzzlePiece|null}
   */
  hitTest(x, y) {
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const piece = this.pieces[i];
      if (piece.locked) continue;
      if (
        x >= piece.x && x <= piece.x + piece.size &&
        y >= piece.y && y <= piece.y + piece.size
      ) {
        return piece;
      }
    }
    return null;
  }

  /**
   * Mulai men-drag sebuah piece pada titik cursor tertentu.
   * @param {number} handIndex - 0 atau 1, mengidentifikasi tangan mana yang menggrab
   */
  grab(handIndex, piece, cursorX, cursorY) {
    // Pindahkan ke akhir array supaya digambar paling atas (di atas piece lain)
    const idx = this.pieces.indexOf(piece);
    this.pieces.splice(idx, 1);
    this.pieces.push(piece);

    piece.grabOffsetX = cursorX - piece.x;
    piece.grabOffsetY = cursorY - piece.y;
    piece.falling = false;
    piece.vy = 0;
    this.heldPieces.set(handIndex, piece);
  }

  /**
   * Menggerakkan piece yang sedang digrab oleh tangan tertentu mengikuti cursor.
   */
  dragTo(handIndex, cursorX, cursorY) {
    const piece = this.heldPieces.get(handIndex);
    if (!piece) return;
    const size = piece.size;
    piece.x = Utils.clamp(cursorX - piece.grabOffsetX, 0, this.boardSize - size);
    piece.y = Utils.clamp(cursorY - piece.grabOffsetY, 0, this.boardSize - size);
  }

  /**
   * Melepas piece yang sedang di-drag oleh tangan tertentu
   * (dipanggil saat status Grab -> Release).
   * Jika posisinya cukup dekat dengan target -> snap & lock.
   * Jika tidak -> aktifkan animasi jatuh singkat.
   * @returns {boolean} true jika snap terjadi (piece terpasang benar)
   */
  release(handIndex) {
    const piece = this.heldPieces.get(handIndex);
    if (!piece) return false;
    this.heldPieces.delete(handIndex);

    const dist = Utils.distance(
      { x: piece.centerX, y: piece.centerY },
      { x: piece.targetX + piece.size / 2, y: piece.targetY + piece.size / 2 }
    );
    const snapThreshold = piece.size * SNAP_THRESHOLD_RATIO;

    if (dist <= snapThreshold) {
      piece.x = piece.targetX;
      piece.y = piece.targetY;
      piece.locked = true;
      this.correctCount++;
      return true;
    }

    // Tidak pas -> jatuh
    piece.falling = true;
    piece.vy = 0;
    piece.fallTimer = FALL_TIME_LIMIT;
    return false;
  }

  /**
   * Apakah piece tertentu sedang dipegang oleh salah satu tangan.
   */
  isHeld(piece) {
    for (const p of this.heldPieces.values()) {
      if (p === piece) return true;
    }
    return false;
  }

  /**
   * Update fisika sederhana (animasi jatuh) tiap frame.
   * @param {number} dt - delta time dalam detik
   */
  update(dt) {
    this.pieces.forEach((piece) => {
      if (!piece.falling) return;

      piece.vy += GRAVITY * dt;
      piece.y += piece.vy * dt;
      piece.fallTimer -= dt;

      const maxY = this.boardSize - piece.size;
      if (piece.y >= maxY) {
        piece.y = maxY;
        piece.falling = false;
        piece.vy = 0;
      } else if (piece.fallTimer <= 0) {
        piece.falling = false;
        piece.vy = 0;
      }
    });
  }

  /**
   * Menggambar seluruh board: latar, grid target, dan tiap potongan.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.clearRect(0, 0, this.boardSize, this.boardSize);

    // Latar board
    ctx.fillStyle = '#0d1420';
    ctx.fillRect(0, 0, this.boardSize, this.boardSize);

    if (!this.sourceImage) return;

    const pieceSize = this.boardSize / this.gridSize;

    // Gambar outline slot target (bantuan visual, garis putus-putus)
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 199, 0.18)';
    ctx.setLineDash([4, 4]);
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        ctx.strokeRect(c * pieceSize, r * pieceSize, pieceSize, pieceSize);
      }
    }
    ctx.restore();

    // Gambar tiap piece (urutan array = urutan render, terakhir = paling atas)
    this.pieces.forEach((piece) => {
      ctx.save();

      const held = this.isHeld(piece);

      if (held) {
        ctx.shadowColor = '#ff6b4a';
        ctx.shadowBlur = 18;
      } else if (piece.locked) {
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 6;
      }

      ctx.drawImage(
        this.sourceImage,
        piece.sx, piece.sy, piece.sw, piece.sh,
        piece.x, piece.y, piece.size, piece.size
      );

      // Border tiap piece
      ctx.strokeStyle = piece.locked
        ? '#4ade80'
        : (held ? '#ff6b4a' : 'rgba(255,255,255,0.35)');
      ctx.lineWidth = piece.locked ? 2 : 1.5;
      ctx.strokeRect(piece.x + 0.75, piece.y + 0.75, piece.size - 1.5, piece.size - 1.5);

      ctx.restore();
    });
  }

  get totalPieces() {
    return this.pieces.length;
  }

  get progress() {
    return this.pieces.length ? this.correctCount / this.pieces.length : 0;
  }

  get isComplete() {
    return this.pieces.length > 0 && this.correctCount === this.pieces.length;
  }
}
