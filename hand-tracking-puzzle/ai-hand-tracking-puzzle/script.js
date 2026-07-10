/**
 * =============================================================
 *  SCRIPT.JS
 *  Orkestrator utama aplikasi "AI Hand Tracking Puzzle".
 *  Menghubungkan: CameraManager, HandTrackingEngine, GestureDetector,
 *  dan PuzzleEngine, sekaligus mengatur seluruh interaksi UI
 *  (tombol, upload gambar, pilihan grid, timer, modal, toast, dsb).
 * =============================================================
 */

(() => {
  'use strict';

  /* ---------------------------------------------------------
   *  DOM REFERENCES
   * --------------------------------------------------------- */
  const videoEl = document.getElementById('inputVideo');
  const overlayCanvas = document.getElementById('overlayCanvas');
  const puzzleCanvas = document.getElementById('puzzleCanvas');
  const puzzleCtx = puzzleCanvas.getContext('2d');

  const cameraLoading = document.getElementById('cameraLoading');
  const cameraHint = document.getElementById('cameraHint');
  const puzzleHint = document.getElementById('puzzleHint');

  const fpsValueEl = document.getElementById('fpsValue');
  const timerValueEl = document.getElementById('timerValue');
  const statusValueEl = document.getElementById('statusValue');
  const statusDotEl = document.getElementById('statusDot');

  const progressValueEl = document.getElementById('progressValue');
  const progressFillEl = document.getElementById('progressFill');
  const correctCountEl = document.getElementById('correctCount');
  const totalCountEl = document.getElementById('totalCount');
  const statTimeEl = document.getElementById('statTime');
  const statHandsEl = document.getElementById('statHands');
  const statStatusEl = document.getElementById('statStatus');
  const gridBadgeEl = document.getElementById('gridBadge');
  const previewImageEl = document.getElementById('previewImage');

  const btnStart = document.getElementById('btnStart');
  const btnShuffle = document.getElementById('btnShuffle');
  const btnPause = document.getElementById('btnPause');
  const btnResume = document.getElementById('btnResume');
  const btnReset = document.getElementById('btnReset');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const imageUpload = document.getElementById('imageUpload');
  const difficultySelect = document.getElementById('difficultySelect');

  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalScoreEl = document.getElementById('modalScore');
  const modalTimeEl = document.getElementById('modalTime');
  const btnPlayAgain = document.getElementById('btnPlayAgain');

  const toastEl = document.getElementById('toast');
  const appEl = document.getElementById('app');

  /* ---------------------------------------------------------
   *  STATE APLIKASI
   * --------------------------------------------------------- */
  const appState = {
    running: false,       // true setelah Start/Shuffle ditekan (sesi bermain aktif)
    paused: false,        // true bila Pause ditekan
    elapsedSeconds: 0,     // akumulasi waktu bermain
    gridSize: 3,
    cameraReady: false,
    completed: false,
  };

  // Instance modul inti
  const puzzleEngine = new PuzzleEngine(puzzleCanvas.width);
  const gestureDetector = new GestureDetector();
  const cameraManager = new CameraManager(videoEl);
  let handTrackingEngine = null;

  // Menyimpan status grab tiap tangan pada frame SEBELUMNYA,
  // dipakai untuk mendeteksi transisi Release->Grab dan Grab->Release.
  const prevGrabState = new Map();
  // Menyimpan posisi cursor board (untuk digambar) tiap tangan aktif.
  const activeHandCursors = new Map();

  let lastFrameTime = performance.now();

  /* ---------------------------------------------------------
   *  UTIL UI KECIL
   * --------------------------------------------------------- */
  function showToast(message, durationMs = 2600) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('is-visible'), durationMs);
  }

  function setButtonStates() {
    btnPause.disabled = !appState.running || appState.paused;
    btnResume.disabled = !appState.running || !appState.paused;
    btnStart.disabled = appState.running && !appState.completed;
  }

  /* ---------------------------------------------------------
   *  MEMUAT GAMBAR PUZZLE (default / upload) LALU MEMOTONGNYA
   * --------------------------------------------------------- */
  function setPuzzleImage(imageEl) {
    puzzleEngine.loadImage(imageEl, appState.gridSize);
    puzzleEngine.resetPositions(); // tampilkan tersusun rapi sebagai referensi awal
    previewImageEl.src = imageEl.src;

    totalCountEl.textContent = puzzleEngine.totalPieces;
    correctCountEl.textContent = '0';
    gridBadgeEl.textContent = `${appState.gridSize} × ${appState.gridSize}`;
    updateProgressUI();
  }

  /* ---------------------------------------------------------
   *  TIMER & PROGRESS
   * --------------------------------------------------------- */
  function updateTimerUI() {
    const formatted = Utils.formatTime(appState.elapsedSeconds);
    timerValueEl.textContent = formatted;
    statTimeEl.textContent = formatted;
  }

  function updateProgressUI() {
    const pct = Math.round(puzzleEngine.progress * 100);
    progressValueEl.textContent = `${pct}%`;
    progressFillEl.style.width = `${pct}%`;
    correctCountEl.textContent = puzzleEngine.correctCount;
  }

  function updateStatusUI(anyGrab) {
    statusValueEl.textContent = anyGrab ? 'GRAB' : 'RELEASE';
    statusDotEl.classList.toggle('is-grab', anyGrab);
    statusDotEl.classList.toggle('is-release', !anyGrab);
    statStatusEl.textContent = !appState.running
      ? 'Idle'
      : (appState.paused ? 'Paused' : (anyGrab ? 'Grabbing' : 'Tracking'));
  }

  /* ---------------------------------------------------------
   *  GAME FLOW: START / SHUFFLE / PAUSE / RESUME / RESET
   * --------------------------------------------------------- */
  function startGame() {
    if (!puzzleEngine.sourceImage) {
      showToast('Gambar puzzle belum siap, mohon tunggu sebentar…');
      return;
    }
    puzzleEngine.shuffle();
    appState.running = true;
    appState.paused = false;
    appState.completed = false;
    appState.elapsedSeconds = 0;
    updateProgressUI();
    updateTimerUI();
    hideModal();
    setButtonStates();
    showToast('Puzzle diacak! Gunakan Pinch untuk mengambil potongan.');
  }

  function shuffleGame() {
    if (!puzzleEngine.sourceImage) {
      showToast('Gambar puzzle belum siap, mohon tunggu sebentar…');
      return;
    }
    puzzleEngine.shuffle();
    appState.running = true;
    appState.paused = false;
    appState.completed = false;
    appState.elapsedSeconds = 0;
    updateProgressUI();
    updateTimerUI();
    hideModal();
    setButtonStates();
  }

  function pauseGame() {
    if (!appState.running) return;
    appState.paused = true;
    setButtonStates();
  }

  function resumeGame() {
    if (!appState.running) return;
    appState.paused = false;
    setButtonStates();
  }

  function resetGame() {
    puzzleEngine.resetPositions();
    appState.running = false;
    appState.paused = false;
    appState.completed = false;
    appState.elapsedSeconds = 0;
    prevGrabState.clear();
    updateProgressUI();
    updateTimerUI();
    hideModal();
    setButtonStates();
  }

  function completePuzzle() {
    appState.running = false;
    appState.completed = true;

    const total = puzzleEngine.totalPieces;
    // Skor: dasar per potongan dikurangi penalti waktu, minimum 0.
    const score = Math.max(0, total * 1000 - Math.round(appState.elapsedSeconds) * 15);

    modalScoreEl.textContent = score;
    modalTimeEl.textContent = Utils.formatTime(appState.elapsedSeconds);
    showModal();
    setButtonStates();
  }

  function showModal() { modalBackdrop.classList.add('is-visible'); }
  function hideModal() { modalBackdrop.classList.remove('is-visible'); }

  /* ---------------------------------------------------------
   *  FULLSCREEN
   * --------------------------------------------------------- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      appEl.requestFullscreen?.().catch(() => showToast('Fullscreen tidak didukung browser ini.'));
    } else {
      document.exitFullscreen?.();
    }
  }

  /* ---------------------------------------------------------
   *  HANDLER GESTURE -> INTERAKSI PUZZLE
   *  Dipanggil setiap kali MediaPipe menghasilkan prediksi baru.
   * --------------------------------------------------------- */
  function onHandResults(hands) {
    // FPS dihitung dari laju aktual callback deteksi tangan (throughput AI).
    const fps = cameraManager.tick();
    fpsValueEl.textContent = fps;

    const activeIndices = new Set();
    let anyGrab = false;

    hands.forEach((landmarks, handIndex) => {
      activeIndices.add(handIndex);

      const gestureState = gestureDetector.analyze(landmarks, handIndex);
      if (gestureState.isGrab) anyGrab = true;

      // Mirror sumbu X supaya arah gerak cursor sesuai dengan tampilan
      // video yang sudah di-mirror secara visual (natural, seperti cermin).
      const boardX = (1 - gestureState.cursor.x) * puzzleEngine.boardSize;
      const boardY = gestureState.cursor.y * puzzleEngine.boardSize;

      activeHandCursors.set(handIndex, { x: boardX, y: boardY, isGrab: gestureState.isGrab });

      handleGestureTransition(handIndex, gestureState.isGrab, boardX, boardY);
    });

    // Bersihkan state tangan yang sudah tidak terdeteksi di frame ini
    for (const idx of Array.from(activeHandCursors.keys())) {
      if (!activeIndices.has(idx)) {
        releaseHand(idx);
        activeHandCursors.delete(idx);
        prevGrabState.delete(idx);
        gestureDetector.handStates.delete(idx);
      }
    }

    statHandsEl.textContent = hands.length;
    updateStatusUI(anyGrab);

    // Sembunyikan overlay loading begitu deteksi pertama berhasil berjalan
    if (!appState.cameraReady) {
      appState.cameraReady = true;
      cameraLoading.classList.add('is-hidden');
    }
  }

  /**
   * Menentukan transisi status grab per-tangan (Release->Grab / tetap
   * Grab / Grab->Release) lalu meneruskannya ke PuzzleEngine.
   */
  function handleGestureTransition(handIndex, isGrab, x, y) {
    const wasGrab = prevGrabState.get(handIndex) || false;

    // Interaksi puzzle hanya berlaku saat sesi berjalan & tidak sedang pause
    const canInteract = appState.running && !appState.paused;

    if (canInteract) {
      if (isGrab && !wasGrab) {
        // Baru mulai pinch -> coba ambil potongan di bawah cursor
        const piece = puzzleEngine.hitTest(x, y);
        if (piece) {
          puzzleEngine.grab(handIndex, piece, x, y);
          puzzleHint.style.opacity = '0';
        }
      } else if (isGrab && wasGrab) {
        // Masih pinch -> geser potongan yang dipegang
        puzzleEngine.dragTo(handIndex, x, y);
      } else if (!isGrab && wasGrab) {
        // Baru melepas pinch -> evaluasi snap / jatuh
        const snapped = puzzleEngine.release(handIndex);
        updateProgressUI();
        puzzleHint.style.opacity = '1';
        if (snapped) {
          showToast('✔ Potongan terpasang!', 1200);
          if (puzzleEngine.isComplete) {
            completePuzzle();
          }
        }
      }
    }

    prevGrabState.set(handIndex, isGrab);
  }

  function releaseHand(handIndex) {
    if (puzzleEngine.heldPieces.has(handIndex)) {
      puzzleEngine.release(handIndex);
      updateProgressUI();
    }
  }

  /* ---------------------------------------------------------
   *  RENDER LOOP (independen dari laju deteksi MediaPipe)
   *  Bertugas: animasi fisika puzzle, timer, dan menggambar board.
   * --------------------------------------------------------- */
  function renderLoop(timestamp) {
    const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;

    if (appState.running && !appState.paused) {
      puzzleEngine.update(dt);
      appState.elapsedSeconds += dt;
      updateTimerUI();
    }

    drawBoard();
    requestAnimationFrame(renderLoop);
  }

  /**
   * Menggambar board puzzle + indikator cursor tiap tangan aktif.
   */
  function drawBoard() {
    puzzleEngine.draw(puzzleCtx);

    activeHandCursors.forEach((cursor) => {
      puzzleCtx.save();
      puzzleCtx.beginPath();
      puzzleCtx.arc(cursor.x, cursor.y, cursor.isGrab ? 14 : 10, 0, Math.PI * 2);
      puzzleCtx.strokeStyle = cursor.isGrab ? '#ff6b4a' : '#00e5c7';
      puzzleCtx.lineWidth = 2.5;
      puzzleCtx.shadowColor = cursor.isGrab ? '#ff6b4a' : '#00e5c7';
      puzzleCtx.shadowBlur = 12;
      puzzleCtx.stroke();

      if (cursor.isGrab) {
        puzzleCtx.beginPath();
        puzzleCtx.arc(cursor.x, cursor.y, 3, 0, Math.PI * 2);
        puzzleCtx.fillStyle = '#ff6b4a';
        puzzleCtx.fill();
      }
      puzzleCtx.restore();
    });
  }

  /* ---------------------------------------------------------
   *  EVENT LISTENERS — TOMBOL & INPUT
   * --------------------------------------------------------- */
  btnStart.addEventListener('click', startGame);
  btnShuffle.addEventListener('click', shuffleGame);
  btnPause.addEventListener('click', pauseGame);
  btnResume.addEventListener('click', resumeGame);
  btnReset.addEventListener('click', resetGame);
  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnPlayAgain.addEventListener('click', () => {
    hideModal();
    startGame();
  });

  difficultySelect.addEventListener('change', (e) => {
    appState.gridSize = parseInt(e.target.value, 10);
    if (puzzleEngine.sourceImage) {
      setPuzzleImage(puzzleEngine.sourceImage);
    }
    resetGame();
  });

  imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = await Utils.loadImageFromFile(file);
      setPuzzleImage(img);
      resetGame();
      showToast('Gambar berhasil diunggah!');
    } catch (err) {
      showToast('Gagal memuat gambar. Coba file lain.');
    }
  });

  // Sinkronkan label tombol fullscreen saat status berubah (mis. tekan ESC)
  document.addEventListener('fullscreenchange', () => {
    btnFullscreen.textContent = document.fullscreenElement ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
  });

  /* ---------------------------------------------------------
   *  INISIALISASI APLIKASI
   * --------------------------------------------------------- */
  async function initApp() {
    setButtonStates();

    // 1. Siapkan gambar puzzle default (prosedural) sambil menunggu kamera
    try {
      const defaultImage = await Utils.generateDefaultPuzzleImage();
      setPuzzleImage(defaultImage);
    } catch (err) {
      showToast('Gagal membuat gambar default.');
    }

    // 2. Aktifkan webcam secara otomatis
    try {
      await cameraManager.start();
    } catch (err) {
      cameraLoading.querySelector('p').textContent =
        'Tidak dapat mengakses webcam. Izinkan akses kamera lalu muat ulang halaman.';
      showToast('Akses webcam ditolak atau tidak tersedia.', 4000);
      return;
    }

    // 3. Sesuaikan resolusi canvas overlay dengan resolusi video asli
    overlayCanvas.width = cameraManager.videoWidth;
    overlayCanvas.height = cameraManager.videoHeight;

    // 4. Inisialisasi MediaPipe Hands & mulai loop deteksi
    handTrackingEngine = new HandTrackingEngine({
      videoElement: videoEl,
      overlayCanvas,
      onResults: onHandResults,
    });
    handTrackingEngine.init();
    handTrackingEngine.start();

    // 5. Mulai render loop puzzle (independen dari MediaPipe)
    requestAnimationFrame(renderLoop);
  }

  window.addEventListener('DOMContentLoaded', initApp);
})();
