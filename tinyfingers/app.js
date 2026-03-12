(() => {
  'use strict';

  const canvas = document.getElementById('stage');
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const startPlayBtn = document.getElementById('start-play');
  const panel = document.getElementById('parent-panel');
  const soundToggle = document.getElementById('sound-toggle');
  const sparkleToggle = document.getElementById('sparkle-toggle');
  const themeSelect = document.getElementById('theme-select');
  const idleToggle = document.getElementById('idle-toggle');
  const motionToggle = document.getElementById('motion-toggle');
  const emojiToggle = document.getElementById('emoji-toggle');
  const glyphCountSelect = document.getElementById('glyph-count');
  const exitFullscreenBtn = document.getElementById('exit-fullscreen');
  const closePanelBtn = document.getElementById('close-panel');
  const pinInput = document.getElementById('pin-input');
  const pinOverlay = document.getElementById('pin-overlay');
  const pinVerifyInput = document.getElementById('pin-verify');
  const pinErrorMsg = document.getElementById('pin-error');
  const pinCancelBtn = document.getElementById('pin-cancel');
  const pinConfirmBtn = document.getElementById('pin-confirm');

  if (!canvas || !panel) {
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    return;
  }

  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const THEMES = {
    confetti: {
      label: 'Confetti',
      background: '#1d293a',
      palette: ['#ffd166', '#06d6a0', '#4cc9f0', '#f28482', '#f7b267'],
      burst: 16,
      speedMin: 70,
      speedMax: 210,
      lifeMin: 0.8,
      lifeMax: 1.5,
      gravity: 70,
      tone: 430
    },
    bubbles: {
      label: 'Bubbles',
      background: '#13344b',
      palette: ['#8ad9ff', '#6ec7ff', '#d0f0ff', '#a8dcff', '#7bc8f6'],
      burst: 12,
      speedMin: 30,
      speedMax: 90,
      lifeMin: 1.8,
      lifeMax: 3.0,
      gravity: -8,
      tone: 320
    },
    space: {
      label: 'Space',
      background: '#070d1a',
      palette: ['#b4c9ff', '#8fb0ff', '#d7e2ff', '#8ce2ff', '#f0ddff'],
      burst: 14,
      speedMin: 90,
      speedMax: 260,
      lifeMin: 0.9,
      lifeMax: 1.8,
      gravity: 5,
      tone: 520
    },
    underwater: {
      label: 'Underwater',
      background: '#0f2f3b',
      palette: ['#6de2d2', '#82d7f5', '#9af4d7', '#67b7d1', '#9ddfef'],
      burst: 13,
      speedMin: 35,
      speedMax: 120,
      lifeMin: 1.4,
      lifeMax: 2.6,
      gravity: -14,
      tone: 360
    }
  };

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    particles: [],
    glyphs: [],
    theme: 'space',
    idleDemo: true,
    soundEnabled: true,
    sparkleSoundEnabled: false,
    welcomeVisible: Boolean(welcomeOverlay),
    reduceMotion: reducedMotionMedia.matches,
    reduceMotionMode: 'system',
    fullEmoji: false,
    glyphCount: 1,
    panelOpen: false,
    pinDialogOpen: false,
    pointerDown: false,
    pointerId: null,
    longPressTimer: null,
    longPressStart: null,
    keyBuffer: [],
    emojiBag: [],
    lastEmoji: null,
    audioContext: null,
    noiseBuffer: null,
    sparkleNoiseBuffer: null,
    lastToneAt: 0,
    lastSparkToneAt: 0,
    cometVoice: null,
    cometVoiceUntil: 0,
    melodyStep: 0,
    melodyDegree: 2,
    melodyMidi: 72,
    trailCooldownUntil: 0,
    lastTrailPoint: null,
    fullscreenRequested: false,
    lastInputAt: performance.now(),
    lastIdleEmitAt: performance.now(),
    lastFrameTime: performance.now(),
    fpsSamples: [],
    lastFpsCheckAt: performance.now(),
    lowPowerLevel: 0,
    brightDots: [],
    exitPin: '1234'
  };

  const LONG_PRESS_MS = 2000;
  const LONG_PRESS_CORNER = 64;
  const LONG_PRESS_MOVE_TOLERANCE = 14;
  const IDLE_START_MS = 3000;
  const IDLE_EMIT_MS = 700;
  const MELODY_SCALE = [0, 2, 4, 7, 9];
  const MELODY_CHORD_PREFS = [
    [0, 1, 2, 3],
    [0, 2, 3, 4],
    [0, 2, 3, 4],
    [0, 1, 3, 4]
  ];
  const PROGRESSION_BASS_MIDI = [48, 55, 57, 53];

  const BLOCKED_KEYS = new Set([
    'Tab',
    'Escape',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F12'
  ]);

  const EMOJI_POOL = ['😀', '⭐', '🌈', '🐳', '🚀', '🎈', '🫧', '🪐', '🦋', '🍀'];
  const GLYPH_COLORS = {
    confetti: ['#ffd84d', '#ff6b6b', '#59e8a7', '#5ac8ff', '#ffae52'],
    bubbles: ['#7fd6ff', '#55c0ff', '#78e8ff', '#67d8c9', '#a7dcff'],
    space: ['#74bcff', '#9fb7ff', '#ff9bd4', '#ffd666', '#86f2ff'],
    underwater: ['#67e2d2', '#6fcdf3', '#8ef0ca', '#7fc1ff', '#7fe7dd']
  };
  const TRAIL_COLORS = {
    confetti: ['#ffd166', '#f15f86', '#18d8a8', '#4fc7ff', '#f7b267'],
    bubbles: ['#73d1ff', '#58bfff', '#92e6ff', '#6fdccc', '#b9e8ff'],
    space: ['#6fb8ff', '#94c7ff', '#a69cff', '#ff9ed6', '#8cefff'],
    underwater: ['#63decf', '#72cfee', '#8ce7ca', '#82cfff', '#75dbd4']
  };

  const panelInputs = [soundToggle, sparkleToggle, themeSelect, idleToggle, motionToggle, emojiToggle, glyphCountSelect, pinInput].filter(Boolean);
  panelInputs.forEach((input) => {
    input.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
  });
  panel.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  if (welcomeOverlay) {
    welcomeOverlay.addEventListener('pointerdown', onWelcomePointerDown);
    welcomeOverlay.addEventListener('pointermove', onWelcomePointerMove, { passive: true });
    welcomeOverlay.addEventListener('click', onWelcomeClick);
  }

  initializeUI();
  initializeEvents();
  resizeCanvas();
  seedBackgroundDots();
  requestAnimationFrame(tick);

  function initializeUI() {
    if (startPlayBtn) {
      startPlayBtn.addEventListener('click', (event) => {
        event.preventDefault();
        startWelcomeExperience(null, null, 0.8);
      });
    }

    if (soundToggle) {
      soundToggle.checked = state.soundEnabled;
      soundToggle.addEventListener('change', () => {
        state.soundEnabled = soundToggle.checked;
        if (state.soundEnabled || state.sparkleSoundEnabled) {
          ensureAudioContext();
        }
        if (!state.soundEnabled) {
          state.lastToneAt = 0;
        }
        if (!state.soundEnabled && !state.sparkleSoundEnabled) {
          state.cometVoiceUntil = 0;
        }
      });
    }

    if (sparkleToggle) {
      sparkleToggle.checked = state.sparkleSoundEnabled;
      sparkleToggle.addEventListener('change', () => {
        state.sparkleSoundEnabled = sparkleToggle.checked;
        if (state.soundEnabled || state.sparkleSoundEnabled) {
          ensureAudioContext();
        } else {
          state.cometVoiceUntil = 0;
        }
        if (!state.sparkleSoundEnabled) {
          state.lastSparkToneAt = 0;
          state.cometVoiceUntil = 0;
        }
      });
    }

    if (themeSelect) {
      themeSelect.value = state.theme;
      themeSelect.addEventListener('change', () => {
        state.theme = themeSelect.value in THEMES ? themeSelect.value : 'confetti';
        seedBackgroundDots();
      });
    }

    if (idleToggle) {
      idleToggle.checked = state.idleDemo;
      idleToggle.addEventListener('change', () => {
        state.idleDemo = idleToggle.checked;
        markInput();
      });
    }

    if (motionToggle) {
      motionToggle.checked = state.reduceMotion;
      motionToggle.addEventListener('change', () => {
        state.reduceMotion = motionToggle.checked;
        state.reduceMotionMode = 'manual';
        seedBackgroundDots();
      });
    }

    if (emojiToggle) {
      emojiToggle.checked = state.fullEmoji;
      emojiToggle.addEventListener('change', () => {
        state.fullEmoji = emojiToggle.checked;
      });
    }

    if (glyphCountSelect) {
      glyphCountSelect.value = String(state.glyphCount);
      glyphCountSelect.addEventListener('change', () => {
        const parsed = Number.parseInt(glyphCountSelect.value, 10);
        state.glyphCount = Number.isFinite(parsed)
          ? Math.max(1, Math.min(5, parsed))
          : 1;
        glyphCountSelect.value = String(state.glyphCount);
      });
    }

    if (pinInput) {
      pinInput.value = state.exitPin;
      pinInput.addEventListener('input', () => {
        const val = pinInput.value.replace(/[^0-9]/g, '');
        pinInput.value = val;
        if (val.length >= 1) {
          state.exitPin = val;
        }
      });
      pinInput.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
      });
    }

    if (exitFullscreenBtn) {
      exitFullscreenBtn.addEventListener('click', () => {
        showPinDialog();
      });
    }

    if (closePanelBtn) {
      closePanelBtn.addEventListener('click', () => {
        closeParentPanel();
      });
    }

    if (pinCancelBtn) {
      pinCancelBtn.addEventListener('click', () => {
        closePinDialog();
      });
    }

    if (pinConfirmBtn) {
      pinConfirmBtn.addEventListener('click', () => {
        verifyPin();
      });
    }

    if (pinVerifyInput) {
      pinVerifyInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          verifyPin();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          closePinDialog();
        }
        event.stopPropagation();
      });
      pinVerifyInput.addEventListener('input', () => {
        pinVerifyInput.value = pinVerifyInput.value.replace(/[^0-9]/g, '');
      });
      pinVerifyInput.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
      });
    }

    if (pinOverlay) {
      pinOverlay.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
      });
      pinOverlay.addEventListener('click', (event) => {
        if (event.target === pinOverlay) {
          closePinDialog();
        }
      });
    }

    reducedMotionMedia.addEventListener('change', (event) => {
      if (state.reduceMotionMode === 'system') {
        state.reduceMotion = event.matches;
        if (motionToggle) {
          motionToggle.checked = state.reduceMotion;
        }
        seedBackgroundDots();
      }
    });
  }

  function showPinDialog() {
    state.pinDialogOpen = true;
    if (pinVerifyInput) {
      pinVerifyInput.value = '';
    }
    if (pinErrorMsg) {
      pinErrorMsg.hidden = true;
    }
    if (pinOverlay) {
      pinOverlay.hidden = false;
      pinOverlay.setAttribute('aria-hidden', 'false');
    }
    closeParentPanel();
    if (pinVerifyInput) {
      setTimeout(() => pinVerifyInput.focus(), 50);
    }
  }

  function closePinDialog() {
    state.pinDialogOpen = false;
    if (pinOverlay) {
      pinOverlay.hidden = true;
      pinOverlay.setAttribute('aria-hidden', 'true');
    }
    if (pinVerifyInput) {
      pinVerifyInput.value = '';
    }
    if (pinErrorMsg) {
      pinErrorMsg.hidden = true;
    }
    markInput();
  }

  function verifyPin() {
    const entered = pinVerifyInput ? pinVerifyInput.value : '';
    if (entered === state.exitPin) {
      closePinDialog();
      exitFullscreen();
    } else {
      if (pinErrorMsg) {
        pinErrorMsg.hidden = false;
        pinErrorMsg.style.animation = 'none';
        void pinErrorMsg.offsetHeight;
        pinErrorMsg.style.animation = '';
      }
      if (pinVerifyInput) {
        pinVerifyInput.value = '';
        pinVerifyInput.focus();
      }
    }
  }

  function initializeEvents() {
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('orientationchange', resizeCanvas, { passive: true });
    window.addEventListener('pointerup', onGlobalPointerEnd, { passive: true });
    window.addEventListener('pointercancel', onGlobalPointerEnd, { passive: true });

    document.addEventListener('visibilitychange', () => {
      state.lastFrameTime = performance.now();
      state.lastInputAt = performance.now();
      state.lastIdleEmitAt = performance.now();
    });

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', onPointerCancel, { passive: false });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    document.addEventListener('keydown', onKeyDown, { passive: false });

    document.addEventListener('fullscreenchange', () => {
      resizeCanvas();
    });

    document.addEventListener('webkitfullscreenchange', () => {
      resizeCanvas();
    });
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }
    if (state.pinDialogOpen) {
      return;
    }

    event.preventDefault();
    dismissWelcome();
    tryEnterFullscreen();
    ensureAudioContext();

    const point = toCanvasPoint(event.clientX, event.clientY);
    markInput();

    state.pointerDown = true;
    state.pointerId = event.pointerId;

    maybeStartLongPress(event.clientX, event.clientY, event.pointerId);

    spawnBurst(point.x, point.y, 1.0, false, true);
  }

  function onPointerMove(event) {
    if (state.panelOpen || state.pinDialogOpen) {
      return;
    }

    const activeDrag = state.pointerDown && event.pointerId === state.pointerId;
    const mouseHover = !state.pointerDown && event.pointerType === 'mouse';
    if (!activeDrag && !mouseHover) {
      return;
    }

    if (activeDrag) {
      event.preventDefault();

      if (state.longPressStart) {
        const dx = event.clientX - state.longPressStart.x;
        const dy = event.clientY - state.longPressStart.y;
        if ((dx * dx + dy * dy) > (LONG_PRESS_MOVE_TOLERANCE * LONG_PRESS_MOVE_TOLERANCE)) {
          cancelLongPress();
        }
      }
    }

    const now = performance.now();
    if (now >= state.trailCooldownUntil) {
      const point = toCanvasPoint(event.clientX, event.clientY);
      markInput();

      spawnPointerTrail(point.x, point.y, activeDrag);
      if (activeDrag) {
        spawnBurst(point.x, point.y, 0.5, false, false);
      }

      state.trailCooldownUntil = now + (mouseHover ? 34 : 52);
    }
  }

  function onPointerUp(event) {
    endActivePointer(event.pointerId);
  }

  function onPointerCancel(event) {
    endActivePointer(event.pointerId);
  }

  function onGlobalPointerEnd(event) {
    endActivePointer(event.pointerId);
  }

  function endActivePointer(pointerId) {
    if (pointerId !== state.pointerId) {
      return;
    }

    state.pointerDown = false;
    state.pointerId = null;
    state.lastTrailPoint = null;
    cancelLongPress();
  }

  function onKeyDown(event) {
    if (state.pinDialogOpen) {
      return;
    }

    if (isPanelTarget(event.target) || isWelcomeControlTarget(event.target)) {
      return;
    }

    handleParentWord(event.key);
    if (state.panelOpen) {
      if (event.key === 'Escape') {
        closeParentPanel();
        event.preventDefault();
      }
      return;
    }

    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      dismissWelcome();
    }

    if (shouldBlockKey(event)) {
      event.preventDefault();
    }

    tryEnterFullscreen();
    ensureAudioContext();
    markInput();

    const x = Math.random() * state.width;
    const y = Math.random() * state.height;
    spawnBurst(x, y, 0.9, false, false);

    const glyph = pickGlyph(event.key);
    if (glyph) {
      spawnKeyGlyphs(x, y, glyph);
      playGlyphTone(glyph, 0.92);
    } else {
      playTone(0.72);
    }
  }

  function isPanelTarget(target) {
    return panel.contains(target);
  }

  function isWelcomeControlTarget(target) {
    return Boolean(
      welcomeOverlay &&
      target &&
      welcomeOverlay.contains(target) &&
      target.closest('a, button, input, select, textarea')
    );
  }

  function shouldBlockKey(event) {
    if (event.key === 'F11') {
      return false;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return true;
    }
    return BLOCKED_KEYS.has(event.key);
  }

  function pickGlyph(key) {
    if (typeof key !== 'string' || key.length === 0) {
      return null;
    }

    if (state.fullEmoji) {
      return pickEmoji();
    }

    if (/^[a-z0-9]$/i.test(key)) {
      return key.toUpperCase();
    }

    return pickEmoji();
  }

  function pickEmoji() {
    if (!state.emojiBag.length) {
      state.emojiBag = shuffledCopy(EMOJI_POOL);
      const lastIndex = state.emojiBag.length - 1;
      if (state.lastEmoji && lastIndex > 0 && state.emojiBag[lastIndex] === state.lastEmoji) {
        const swapIndex = Math.floor(Math.random() * lastIndex);
        const saved = state.emojiBag[lastIndex];
        state.emojiBag[lastIndex] = state.emojiBag[swapIndex];
        state.emojiBag[swapIndex] = saved;
      }
    }

    const emoji = state.emojiBag.pop();
    state.lastEmoji = emoji;
    return emoji;
  }

  function spawnKeyGlyphs(x, y, glyph) {
    const count = Math.max(1, Math.min(5, state.glyphCount || 1));
    for (let i = 0; i < count; i += 1) {
      const gx = i === 0 ? x : Math.random() * state.width;
      const gy = i === 0 ? y : Math.random() * state.height;
      spawnGlyph(gx, gy, glyph);
    }
  }

  function maybeStartLongPress(clientX, clientY, pointerId) {
    if (state.panelOpen) {
      return;
    }

    if (clientX > LONG_PRESS_CORNER || clientY > LONG_PRESS_CORNER) {
      return;
    }

    const activePointerId = pointerId;
    state.longPressStart = { x: clientX, y: clientY, pointerId: activePointerId };
    state.longPressTimer = window.setTimeout(() => {
      state.longPressTimer = null;
      if (!state.pointerDown || !state.longPressStart || state.longPressStart.pointerId !== activePointerId) {
        return;
      }
      openParentPanel();
    }, LONG_PRESS_MS);
  }

  function cancelLongPress() {
    state.longPressStart = null;
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
  }

  function handleParentWord(key) {
    if (typeof key !== 'string' || key.length !== 1 || !/[a-z]/i.test(key)) {
      return;
    }

    const now = performance.now();
    state.keyBuffer.push({ key: key.toLowerCase(), time: now });
    state.keyBuffer = state.keyBuffer.filter((entry) => now - entry.time <= 4000);

    const typed = state.keyBuffer.map((entry) => entry.key).join('');
    if (typed.endsWith('parent')) {
      openParentPanel();
      state.keyBuffer = [];
    }
  }

  function openParentPanel() {
    if (state.panelOpen) {
      return;
    }

    state.panelOpen = true;
    dismissWelcome();
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    state.pointerDown = false;
    state.pointerId = null;
    cancelLongPress();
  }

  function closeParentPanel() {
    if (!state.panelOpen) {
      return;
    }

    state.panelOpen = false;
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    markInput();
  }

  function onWelcomePointerDown(event) {
    if (isWelcomeControlTarget(event.target)) {
      return;
    }

    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    state.pointerDown = true;
    state.pointerId = event.pointerId;
    maybeStartLongPress(event.clientX, event.clientY, event.pointerId);
  }

  function onWelcomePointerMove(event) {
    if (!state.longPressStart || event.pointerId !== state.pointerId) {
      return;
    }

    const dx = event.clientX - state.longPressStart.x;
    const dy = event.clientY - state.longPressStart.y;
    if ((dx * dx + dy * dy) > (LONG_PRESS_MOVE_TOLERANCE * LONG_PRESS_MOVE_TOLERANCE)) {
      cancelLongPress();
    }
  }

  function onWelcomeClick(event) {
    if (isWelcomeControlTarget(event.target)) {
      return;
    }

    event.preventDefault();
    startWelcomeExperience(event.clientX, event.clientY, 1.0);
  }

  function startWelcomeExperience(clientX, clientY, strength) {
    dismissWelcome();
    tryEnterFullscreen();
    ensureAudioContext();
    markInput();

    const point = clientX === null || clientY === null
      ? { x: state.width * 0.5, y: state.height * 0.5 }
      : toCanvasPoint(clientX, clientY);

    spawnBurst(point.x, point.y, strength, false, true);
  }

  function dismissWelcome() {
    if (!state.welcomeVisible || !welcomeOverlay) {
      return;
    }

    state.welcomeVisible = false;
    welcomeOverlay.hidden = true;
    welcomeOverlay.setAttribute('aria-hidden', 'true');
  }

  function tryEnterFullscreen() {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (fullscreenElement || state.fullscreenRequested || state.panelOpen) {
      return;
    }

    const root = document.documentElement;
    const request = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
    if (!request) {
      state.fullscreenRequested = true;
      return;
    }

    try {
      const result = request.call(root);
      state.fullscreenRequested = true;
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          state.fullscreenRequested = false;
        });
      }
    } catch (_) {
      state.fullscreenRequested = false;
    }
  }

  function exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!exit) {
      return;
    }

    try {
      const result = exit.call(document);
      state.fullscreenRequested = false;
      if (result && typeof result.catch === 'function') {
        result.catch(() => {});
      }
    } catch (_) {
      // noop
    }
  }

  function ensureAudioContext() {
    if (!state.soundEnabled && !state.sparkleSoundEnabled) {
      return;
    }

    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return;
    }

    if (!state.audioContext) {
      state.audioContext = new AudioCtor();
    }

    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume().catch(() => {});
    }
  }

  function playTone(strength) {
    if (!state.soundEnabled || !state.audioContext || state.audioContext.state !== 'running') {
      return;
    }

    const nowMs = performance.now();
    if (nowMs - state.lastToneAt < 95) {
      return;
    }
    state.lastToneAt = nowMs;

    const progressionIndex = Math.floor(state.melodyStep / 2) % PROGRESSION_BASS_MIDI.length;
    const bassMidi = PROGRESSION_BASS_MIDI[progressionIndex];
    const baseFreq = midiToFrequency(bassMidi);
    const volumeBase = state.reduceMotion ? 0.0019 : 0.0032;
    const volume = Math.min(0.0046, volumeBase * Math.max(0.45, strength));
    const decay = state.reduceMotion ? 0.16 : 0.23;
    playDreamVoice(baseFreq, volume, decay, 'anchor');
  }

  function playGlyphTone(glyph, strength) {
    if (!state.soundEnabled || !state.audioContext || state.audioContext.state !== 'running') {
      return;
    }

    const nowMs = performance.now();
    if (nowMs - state.lastToneAt < 85) {
      return;
    }
    state.lastToneAt = nowMs;

    const isEmoji = !/^[A-Z0-9]$/.test(glyph);
    const midi = nextMelodyMidi(isEmoji);
    const baseFreq = midiToFrequency(midi);
    const volumeBase = isEmoji
      ? (state.reduceMotion ? 0.0027 : 0.0045)
      : (state.reduceMotion ? 0.0029 : 0.0051);
    const volume = Math.min(0.007, volumeBase * Math.max(0.45, strength));
    const decay = isEmoji
      ? (state.reduceMotion ? 0.3 : 0.46)
      : (state.reduceMotion ? 0.34 : 0.54);
    playDreamVoice(baseFreq, volume, decay, isEmoji ? 'emoji' : 'letter');
  }

  function playSparkleTone(flow) {
    if (!state.sparkleSoundEnabled || !state.audioContext || state.audioContext.state !== 'running') {
      return;
    }

    const intensity = Math.min(1, Math.max(0, flow / 1.35));
    const nowMs = performance.now();
    const cadenceMs = state.reduceMotion
      ? (138 - intensity * 34)
      : (118 - intensity * 44);
    if (nowMs - state.lastSparkToneAt < cadenceMs) {
      return;
    }
    state.lastSparkToneAt = nowMs;

    const sparkleMidi = 83 + Math.round(intensity * 8) + (Math.random() < 0.42 ? 2 : 0);
    const base = midiToFrequency(sparkleMidi);
    const volumeBase = state.reduceMotion ? 0.00075 : 0.0012;
    const volume = Math.min(0.0024, volumeBase * (0.92 + intensity * 0.58));
    const decay = state.reduceMotion ? 0.2 : (0.27 + intensity * 0.07);
    playSparkleVoice(base, volume, decay);
  }

  function ensureCometVoice() {
    if (!state.audioContext || state.audioContext.state !== 'running') {
      return null;
    }

    if (state.cometVoice) {
      return state.cometVoice;
    }

    const now = state.audioContext.currentTime;
    const master = state.audioContext.createGain();
    const highpass = state.audioContext.createBiquadFilter();
    const lowpass = state.audioContext.createBiquadFilter();
    const shimmerFilter = state.audioContext.createBiquadFilter();
    const twinkleFilter = state.audioContext.createBiquadFilter();
    const noiseHighpass = state.audioContext.createBiquadFilter();
    const noiseLowpass = state.audioContext.createBiquadFilter();
    const mainGain = state.audioContext.createGain();
    const shimmerGain = state.audioContext.createGain();
    const twinkleGain = state.audioContext.createGain();
    const noiseGain = state.audioContext.createGain();
    const main = state.audioContext.createOscillator();
    const shimmer = state.audioContext.createOscillator();
    const twinkle = state.audioContext.createOscillator();
    const noise = state.audioContext.createBufferSource();
    const sparkleNoise = getSparkleNoiseBuffer();
    if (!sparkleNoise) {
      return null;
    }

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(900, now);
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(10800, now);
    lowpass.Q.setValueAtTime(0.56, now);
    shimmerFilter.type = 'bandpass';
    shimmerFilter.frequency.setValueAtTime(4700, now);
    shimmerFilter.Q.setValueAtTime(1.25, now);
    twinkleFilter.type = 'bandpass';
    twinkleFilter.frequency.setValueAtTime(7000, now);
    twinkleFilter.Q.setValueAtTime(1.75, now);
    noiseHighpass.type = 'highpass';
    noiseHighpass.frequency.setValueAtTime(3800, now);
    noiseLowpass.type = 'lowpass';
    noiseLowpass.frequency.setValueAtTime(9600, now);

    master.gain.setValueAtTime(0.0001, now);
    mainGain.gain.setValueAtTime(0.31, now);
    shimmerGain.gain.setValueAtTime(0.21, now);
    twinkleGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.setValueAtTime(0.00012, now);

    main.type = 'sine';
    shimmer.type = 'sine';
    twinkle.type = 'sine';
    main.frequency.setValueAtTime(1480, now);
    shimmer.frequency.setValueAtTime(3180, now);
    twinkle.frequency.setValueAtTime(4580, now);
    noise.buffer = sparkleNoise;
    noise.loop = true;

    main.connect(mainGain);
    mainGain.connect(master);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(shimmerFilter);
    shimmerFilter.connect(master);
    twinkle.connect(twinkleGain);
    twinkleGain.connect(twinkleFilter);
    twinkleFilter.connect(master);
    noise.connect(noiseGain);
    noiseGain.connect(noiseHighpass);
    noiseHighpass.connect(noiseLowpass);
    noiseLowpass.connect(master);
    master.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(state.audioContext.destination);

    main.start(now);
    shimmer.start(now);
    twinkle.start(now);
    noise.start(now);

    state.cometVoice = {
      master,
      main,
      shimmer,
      twinkle,
      noise,
      mainGain,
      shimmerGain,
      twinkleGain,
      noiseGain,
      shimmerFilter,
      twinkleFilter,
      noiseLowpass,
      twinkleBase: 0.12,
      noiseBase: 0.00012
    };
    return state.cometVoice;
  }

  function updateCometVoice(timestamp) {
    if (!state.cometVoice || !state.audioContext || state.audioContext.state !== 'running') {
      return;
    }

    const active = state.sparkleSoundEnabled && !state.panelOpen && timestamp <= state.cometVoiceUntil;
    const now = state.audioContext.currentTime;

    if (active) {
      const shimmerPulse = 0.84
        + 0.15 * Math.sin(timestamp * 0.024)
        + 0.08 * Math.sin(timestamp * 0.051 + 1.3);
      const airPulse = 0.9 + 0.1 * Math.sin(timestamp * 0.018 + 0.7);
      state.cometVoice.twinkleGain.gain.setTargetAtTime(
        Math.max(0.03, state.cometVoice.twinkleBase * shimmerPulse),
        now,
        0.04
      );
      state.cometVoice.noiseGain.gain.setTargetAtTime(
        Math.max(0.00003, state.cometVoice.noiseBase * airPulse),
        now,
        0.05
      );
      return;
    }

    state.cometVoice.master.gain.setTargetAtTime(0.0001, now, 0.05);
    state.cometVoice.noiseGain.gain.setTargetAtTime(0.00003, now, 0.05);

    const lingerMs = !state.sparkleSoundEnabled || state.panelOpen ? 180 : 520;
    if (timestamp <= state.cometVoiceUntil + lingerMs) {
      return;
    }

    try {
      state.cometVoice.main.stop(now + 0.02);
      state.cometVoice.shimmer.stop(now + 0.02);
      state.cometVoice.twinkle.stop(now + 0.02);
      state.cometVoice.noise.stop(now + 0.02);
    } catch (_) {
      // noop
    }
    state.cometVoice = null;
  }

  function playDreamVoice(baseFreq, volume, decay, mode) {
    if (mode === 'sparkle') {
      playSparkleVoice(baseFreq, volume, decay);
      return;
    }

    const brightness = mode === 'emoji'
      ? 0.78
      : mode === 'letter'
        ? 0.68
        : 0.48;
    playPianoVoice(baseFreq, volume, decay, brightness);
  }

  function playPianoVoice(baseFreq, volume, decay, brightness) {
    const now = state.audioContext.currentTime;
    const master = state.audioContext.createGain();
    const bodyFilter = state.audioContext.createBiquadFilter();
    const highpass = state.audioContext.createBiquadFilter();

    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(2800 + brightness * 1400, now);
    bodyFilter.frequency.exponentialRampToValueAtTime(660 + brightness * 340, now + decay * 1.7);
    bodyFilter.Q.setValueAtTime(0.62, now);

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(45, now);
    highpass.Q.setValueAtTime(0.7, now);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(volume, now + 0.006);
    master.gain.exponentialRampToValueAtTime(Math.max(0.00012, volume * 0.58), now + Math.max(0.08, decay * 0.3));
    master.gain.exponentialRampToValueAtTime(Math.max(0.00011, volume * 0.2), now + decay * 0.95);
    master.gain.exponentialRampToValueAtTime(0.0001, now + decay * 2.2);

    master.connect(bodyFilter);
    bodyFilter.connect(highpass);
    highpass.connect(state.audioContext.destination);

    const partials = [
      { ratio: 1, wave: 'triangle', gain: 1.0, decayFactor: 2.0, glide: 0.998, detuneSpread: 5 },
      { ratio: 2.01, wave: 'sine', gain: 0.24 * brightness, decayFactor: 1.45, glide: 0.995, detuneSpread: 8 },
      { ratio: 3.97, wave: 'sine', gain: 0.1 * brightness, decayFactor: 1.08, glide: 0.992, detuneSpread: 10 },
      { ratio: 6.02, wave: 'sine', gain: 0.04 * brightness, decayFactor: 0.82, glide: 0.989, detuneSpread: 12 }
    ];

    for (let i = 0; i < partials.length; i += 1) {
      const partial = partials[i];
      const osc = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();
      const freq = Math.max(65, baseFreq * partial.ratio);
      const detune = (Math.random() - 0.5) * partial.detuneSpread;

      osc.type = partial.wave;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(60, freq * partial.glide), now + decay * 0.9);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(partial.gain, now + 0.0055);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay * partial.decayFactor);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + decay + 0.08);
    }

    const hammerBuffer = getNoiseBuffer();
    if (hammerBuffer) {
      const noise = state.audioContext.createBufferSource();
      const hammerFilter = state.audioContext.createBiquadFilter();
      const hammerGain = state.audioContext.createGain();

      hammerFilter.type = 'bandpass';
      hammerFilter.frequency.setValueAtTime(1200 + brightness * 420, now);
      hammerFilter.Q.setValueAtTime(0.75, now);

      hammerGain.gain.setValueAtTime(0.0001, now);
      hammerGain.gain.exponentialRampToValueAtTime(Math.min(0.0011, volume * 0.26), now + 0.0016);
      hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

      noise.buffer = hammerBuffer;
      noise.connect(hammerFilter);
      hammerFilter.connect(hammerGain);
      hammerGain.connect(bodyFilter);
      noise.start(now);
      noise.stop(now + 0.03);
    }
  }

  function playSparkleVoice(baseFreq, volume, decay) {
    const now = state.audioContext.currentTime;
    const master = state.audioContext.createGain();
    const highpass = state.audioContext.createBiquadFilter();
    const lowpass = state.audioContext.createBiquadFilter();

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(680, now);
    highpass.Q.setValueAtTime(0.92, now);

    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(10800, now);
    lowpass.frequency.exponentialRampToValueAtTime(5200, now + decay * 1.15);
    lowpass.Q.setValueAtTime(0.52, now);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(volume, now + 0.0032);
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.62), now + decay * 0.16);
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.24), now + decay * 0.5);
    master.gain.exponentialRampToValueAtTime(0.0001, now + decay * 1.05);

    master.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(state.audioContext.destination);

    const partials = [
      { ratio: 1, gain: 1.0, decayFactor: 1.0, detuneSpread: 8 },
      { ratio: 2.72, gain: 0.36, decayFactor: 0.76, detuneSpread: 13 },
      { ratio: 4.18, gain: 0.17, decayFactor: 0.58, detuneSpread: 18 },
      { ratio: 6.86, gain: 0.09, decayFactor: 0.42, detuneSpread: 22 }
    ];

    for (let i = 0; i < partials.length; i += 1) {
      const partial = partials[i];
      const osc = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();
      const endAt = now + Math.max(0.05, decay * partial.decayFactor);
      const freq = Math.max(260, baseFreq * partial.ratio);
      const detune = (Math.random() - 0.5) * partial.detuneSpread;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(220, freq * 0.992), now + decay * 0.62);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(partial.gain, now + 0.0026);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(endAt + 0.01);
    }

    const sparkleBuffer = getSparkleNoiseBuffer();
    if (sparkleBuffer) {
      const noise = state.audioContext.createBufferSource();
      const sparkleFilter = state.audioContext.createBiquadFilter();
      const sparkleGain = state.audioContext.createGain();

      sparkleFilter.type = 'bandpass';
      sparkleFilter.frequency.setValueAtTime(4300 + Math.random() * 1800, now);
      sparkleFilter.Q.setValueAtTime(1.35, now);

      sparkleGain.gain.setValueAtTime(0.0001, now);
      sparkleGain.gain.exponentialRampToValueAtTime(Math.min(0.00058, volume * 0.22), now + 0.0016);
      sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

      noise.buffer = sparkleBuffer;
      noise.connect(sparkleFilter);
      sparkleFilter.connect(sparkleGain);
      sparkleGain.connect(master);
      noise.start(now);
      noise.stop(now + 0.03);
    }
  }

  function getSparkleNoiseBuffer() {
    if (!state.audioContext) {
      return null;
    }

    const sampleRate = state.audioContext.sampleRate;
    if (state.sparkleNoiseBuffer && state.sparkleNoiseBuffer.sampleRate === sampleRate) {
      return state.sparkleNoiseBuffer;
    }

    const length = Math.max(1, Math.floor(sampleRate * 0.45));
    const buffer = state.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let smooth = 0;

    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      smooth = smooth * 0.94 + white * 0.06;
      data[i] = (white * 0.42 + smooth * 0.58) * 0.55;
    }

    state.sparkleNoiseBuffer = buffer;
    return buffer;
  }

  function getNoiseBuffer() {
    if (!state.audioContext) {
      return null;
    }

    const sampleRate = state.audioContext.sampleRate;
    if (state.noiseBuffer && state.noiseBuffer.sampleRate === sampleRate) {
      return state.noiseBuffer;
    }

    const length = Math.max(1, Math.floor(sampleRate * 0.03));
    const buffer = state.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const decay = 1 - (i / data.length);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    state.noiseBuffer = buffer;
    return buffer;
  }

  function nextMelodyMidi(isEmoji) {
    const chordIndex = Math.floor(state.melodyStep / 2) % MELODY_CHORD_PREFS.length;
    const preferred = MELODY_CHORD_PREFS[chordIndex];
    const lastDegree = state.melodyDegree;
    const weights = [];

    for (let i = 0; i < MELODY_SCALE.length; i += 1) {
      let w = 0.35;
      if (preferred.includes(i)) {
        w += 1.05;
      }
      const leap = Math.abs(i - lastDegree);
      if (leap === 0) {
        w += 0.22;
      } else if (leap === 1) {
        w += 0.88;
      } else if (leap === 2) {
        w += 0.46;
      } else {
        w += 0.12;
      }
      weights.push(w);
    }

    const nextDegree = chooseWeightedIndex(weights);
    state.melodyDegree = nextDegree;
    state.melodyStep += 1;

    const targetOctave = isEmoji ? 6 : 5;
    let midi = 12 * (targetOctave + 1) + MELODY_SCALE[nextDegree];
    while (midi - state.melodyMidi > 7) {
      midi -= 12;
    }
    while (state.melodyMidi - midi > 7) {
      midi += 12;
    }

    const minMidi = isEmoji ? 67 : 60;
    const maxMidi = isEmoji ? 92 : 84;
    if (midi < minMidi) {
      midi += 12;
    }
    if (midi > maxMidi) {
      midi -= 12;
    }

    state.melodyMidi = midi;
    return midi;
  }

  function chooseWeightedIndex(weights) {
    const total = weights.reduce((sum, value) => sum + value, 0);
    if (total <= 0) {
      return 0;
    }

    let cursor = Math.random() * total;
    for (let i = 0; i < weights.length; i += 1) {
      cursor -= weights[i];
      if (cursor <= 0) {
        return i;
      }
    }
    return weights.length - 1;
  }

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function seedBackgroundDots() {
    const count = computeBackgroundDotCount();
    state.brightDots = [];
    for (let i = 0; i < count; i += 1) {
      state.brightDots.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 3.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.28 + Math.random() * 0.82,
        drift: 0.7 + Math.random() * 1.55,
        wobble: 2 + Math.random() * 8
      });
    }
  }

  function computeBackgroundDotCount() {
    const area = state.width * state.height;
    let count = Math.round(area / 9200);

    if (state.theme === 'space') {
      count = Math.round(count * 1.52);
    }

    if (state.reduceMotion) {
      count = Math.round(count * 0.65);
    }

    if (state.lowPowerLevel > 0) {
      count = Math.round(count * (1 - state.lowPowerLevel * 0.22));
    }

    return Math.max(36, Math.min(320, count));
  }

  function toCanvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, clientY - rect.top))
    };
  }

  function markInput() {
    const now = performance.now();
    state.lastInputAt = now;
    state.lastIdleEmitAt = now;
  }

  function resizeCanvas() {
    state.width = Math.max(1, window.innerWidth);
    state.height = Math.max(1, window.innerHeight);

    const dprCeiling = state.lowPowerLevel > 0 ? 1.4 : 2;
    state.dpr = Math.min(window.devicePixelRatio || 1, dprCeiling);

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);

    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    seedBackgroundDots();
  }

  function tick(timestamp) {
    const dt = Math.min(0.05, Math.max(0.001, (timestamp - state.lastFrameTime) / 1000));
    state.lastFrameTime = timestamp;

    updatePerformance(timestamp, dt);
    updateIdleDemo(timestamp);
    updateCometVoice(timestamp);
    updateObjects(dt);
    drawScene(timestamp);

    requestAnimationFrame(tick);
  }

  function updatePerformance(timestamp, dt) {
    const fps = 1 / dt;
    state.fpsSamples.push(fps);
    if (state.fpsSamples.length > 90) {
      state.fpsSamples.shift();
    }

    if (timestamp - state.lastFpsCheckAt < 1000) {
      return;
    }

    const avgFps = state.fpsSamples.reduce((sum, value) => sum + value, 0) / state.fpsSamples.length;
    if (avgFps < 44 && state.lowPowerLevel < 2) {
      state.lowPowerLevel += 1;
      resizeCanvas();
    } else if (avgFps > 56 && state.lowPowerLevel > 0) {
      state.lowPowerLevel -= 1;
      resizeCanvas();
    }

    state.lastFpsCheckAt = timestamp;
  }

  function updateIdleDemo(timestamp) {
    if (!state.idleDemo || state.panelOpen) {
      return;
    }

    if (timestamp - state.lastInputAt < IDLE_START_MS) {
      return;
    }

    if (timestamp - state.lastIdleEmitAt >= IDLE_EMIT_MS) {
      const x = Math.random() * state.width;
      const y = Math.random() * state.height;
      spawnBurst(x, y, 0.35, true, false);
      state.lastIdleEmitAt = timestamp;
    }
  }

  function spawnBurst(x, y, strength, idle, withTone) {
    const theme = THEMES[state.theme];
    const count = computeSpawnCount(theme.burst, strength, idle);

    for (let i = 0; i < count; i += 1) {
      state.particles.push(makeParticle(x, y, theme, idle));
    }

    enforceObjectBudget();

    if (withTone && !idle) {
      playTone(strength);
    }
  }

  function spawnPointerTrail(x, y, activeDrag) {
    const previous = state.lastTrailPoint;
    const dx = previous ? x - previous.x : 0;
    const dy = previous ? y - previous.y : 0;
    state.lastTrailPoint = { x, y };

    const distance = Math.hypot(dx, dy);
    let steps = previous ? Math.ceil(distance / 16) : 1;
    steps = Math.max(1, Math.min(5, steps));
    if (state.reduceMotion) {
      steps = Math.max(1, Math.min(2, steps));
    }

    for (let step = 0; step < steps; step += 1) {
      const t = steps === 1 ? 1 : (step + 1) / steps;
      const px = previous ? previous.x + dx * t : x;
      const py = previous ? previous.y + dy * t : y;
      spawnTrailStamp(px, py, dx, dy, activeDrag);
    }

    enforceObjectBudget();
  }

  function spawnTrailStamp(x, y, dx, dy, activeDrag) {
    let count = state.theme === 'space' ? 6 : 5;
    if (!activeDrag) {
      count -= 2;
    }

    if (state.reduceMotion) {
      count = Math.max(2, Math.round(count * 0.58));
    }

    if (state.lowPowerLevel > 0) {
      count = Math.max(2, Math.round(count * (1 - state.lowPowerLevel * 0.3)));
    }

    const speed = Math.hypot(dx, dy);
    const flow = Math.min(1.4, speed / 28);
    if (state.sparkleSoundEnabled && (activeDrag || flow > 0.24)) {
      playSparkleTone(flow);
    }

    for (let i = 0; i < count; i += 1) {
      const trailColor = getTrailColorBySpeed(state.theme, flow);
      const p = {
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: dx * (1.15 + Math.random() * 1.05) + (Math.random() - 0.5) * 25,
        vy: dy * (1.15 + Math.random() * 1.05) + (Math.random() - 0.5) * 25,
        size: randomBetween(10, 20) * (activeDrag ? 1.0 : 0.82) * (1 + flow * 0.08),
        age: 0,
        life: randomBetween(0.28, 0.55),
        gravity: 0,
        rotation: 0,
        spin: 0,
        color: trailColor,
        theme: state.theme,
        trail: true
      };

      state.particles.push(p);
    }

    let headChance = activeDrag ? 0.85 : 0.45;
    if (state.reduceMotion) {
      headChance *= 0.5;
    }
    if (state.lowPowerLevel > 0) {
      headChance *= (1 - state.lowPowerLevel * 0.2);
    }

    if (Math.random() < headChance) {
      const headColor = getTrailColorBySpeed(state.theme, flow + 0.2);
      state.particles.push({
        x,
        y,
        vx: dx * (1.55 + Math.random() * 0.5) + (Math.random() - 0.5) * 14,
        vy: dy * (1.55 + Math.random() * 0.5) + (Math.random() - 0.5) * 14,
        size: randomBetween(14, 24) * (activeDrag ? 1.0 : 0.84),
        age: 0,
        life: randomBetween(0.18, 0.34),
        gravity: 0,
        rotation: 0,
        spin: 0,
        color: headColor,
        theme: state.theme,
        trail: true,
        trailHead: true
      });
    }
  }

  function spawnGlyph(x, y, glyph) {
    const lifetime = state.reduceMotion ? 0.85 : 1.25;
    const minSize = state.reduceMotion ? 30 : 60;
    const sizeJitter = state.reduceMotion ? 60 : 120;
    const size = minSize + Math.random() * sizeJitter;
    const isAsciiGlyph = /^[A-Z0-9]$/.test(glyph);
    const color = pick(GLYPH_COLORS[state.theme] || GLYPH_COLORS.confetti);
    state.glyphs.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 44,
      vy: -32 - Math.random() * 40,
      text: glyph,
      size,
      age: 0,
      life: lifetime,
      color,
      stroke: '#0a1322',
      glow: color,
      isAsciiGlyph,
      sprite: isAsciiGlyph ? null : createEmojiSprite(glyph, size)
    });

    enforceObjectBudget();
  }

  function createEmojiSprite(text, size) {
    const side = Math.max(36, Math.round(size * 1.9));
    const sprite = document.createElement('canvas');
    sprite.width = side;
    sprite.height = side;

    const sctx = sprite.getContext('2d');
    if (!sctx) {
      return null;
    }

    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.font = `${Math.round(size)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Trebuchet MS", "Segoe UI", sans-serif`;
    sctx.fillText(text, side / 2, side / 2);
    return sprite;
  }

  function makeParticle(x, y, theme, idle) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(theme.speedMin, theme.speedMax) * (idle ? 0.5 : 1);
    const life = randomBetween(theme.lifeMin, theme.lifeMax) * (idle ? 1.1 : 1);
    const drift = (Math.random() - 0.5) * 16;

    const particle = {
      x,
      y,
      vx: Math.cos(angle) * speed + drift,
      vy: Math.sin(angle) * speed,
      size: randomBetween(6, 16),
      age: 0,
      life,
      gravity: theme.gravity,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 4,
      color: pick(theme.palette),
      theme: state.theme
    };

    if (state.theme === 'bubbles') {
      particle.vy = -Math.abs(particle.vy) - 10;
      particle.size = randomBetween(8, 20);
    } else if (state.theme === 'space') {
      particle.size = randomBetween(2, 7);
      particle.spin *= 0.4;
    } else if (state.theme === 'underwater') {
      particle.size = randomBetween(7, 18);
      particle.vy = -Math.abs(particle.vy) * 0.65;
      particle.spin *= 0.6;
    }

    return particle;
  }

  function computeSpawnCount(base, strength, idle) {
    let count = Math.max(2, Math.round(base * strength));

    if (state.reduceMotion) {
      count = Math.max(2, Math.round(count * 0.45));
    }

    if (idle) {
      count = Math.max(2, Math.round(count * 0.6));
    }

    if (state.lowPowerLevel > 0) {
      count = Math.max(2, Math.round(count * (1 - state.lowPowerLevel * 0.28)));
    }

    return count;
  }

  function computeParticleCap() {
    let cap = state.reduceMotion ? 130 : 280;
    cap -= state.lowPowerLevel * 70;
    return Math.max(70, cap);
  }

  function computeGlyphCap() {
    let cap = state.reduceMotion ? 18 : 40;
    cap -= state.lowPowerLevel * 8;
    return Math.max(8, cap);
  }

  function enforceObjectBudget() {
    const particleCap = computeParticleCap();
    if (state.particles.length > particleCap) {
      state.particles.splice(0, state.particles.length - particleCap);
    }

    const glyphCap = computeGlyphCap();
    if (state.glyphs.length > glyphCap) {
      state.glyphs.splice(0, state.glyphs.length - glyphCap);
    }
  }

  function updateObjects(dt) {
    const margin = 80;

    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const particle = state.particles[i];
      particle.age += dt;
      particle.rotation += particle.spin * dt;

      if (particle.theme === 'underwater') {
        particle.vx += Math.sin((particle.age + particle.x) * 2.2) * 1.6 * dt;
        particle.vy += particle.gravity * dt;
      } else if (particle.theme === 'space') {
        particle.vx *= 0.995;
        particle.vy *= 0.995;
        particle.vy += particle.gravity * dt;
      } else if (particle.theme === 'bubbles') {
        particle.vx *= 0.992;
        particle.vy += particle.gravity * dt;
      } else {
        particle.vy += particle.gravity * dt;
      }

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      const expired = particle.age >= particle.life;
      const outside =
        particle.x < -margin ||
        particle.x > state.width + margin ||
        particle.y < -margin ||
        particle.y > state.height + margin;

      if (expired || outside) {
        state.particles.splice(i, 1);
      }
    }

    for (let i = state.glyphs.length - 1; i >= 0; i -= 1) {
      const glyph = state.glyphs[i];
      glyph.age += dt;
      glyph.x += glyph.vx * dt;
      glyph.y += glyph.vy * dt;
      glyph.vy += 8 * dt;
      glyph.vx *= 0.994;

      if (glyph.age >= glyph.life) {
        state.glyphs.splice(i, 1);
      }
    }
  }

  function drawScene(timestamp) {
    drawBackground(timestamp);
    drawBackgroundDots(timestamp);
    drawParticles();
    drawGlyphs();
  }

  function drawBackground(timestamp) {
    const base = hexToRgb(THEMES[state.theme].background);
    const pulse = state.reduceMotion ? 0.01 : 0.025;
    const modifier = (Math.sin(timestamp * 0.0004) + 1) * 0.5 * pulse;

    const r = clampChannel(base.r + base.r * modifier);
    const g = clampChannel(base.g + base.g * modifier);
    const b = clampChannel(base.b + base.b * modifier);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function drawBackgroundDots(timestamp) {
    const profile = getDotProfile();
    const alphaScale = state.reduceMotion ? profile.alpha * 0.76 : profile.alpha;
    const driftScale = state.reduceMotion ? profile.drift * 0.52 : profile.drift;
    const time = timestamp * 0.001;
    for (let i = 0; i < state.brightDots.length; i += 1) {
      const dot = state.brightDots[i];
      const xBase = dot.x * state.width;
      const wobble = Math.sin(time * dot.speed * 0.7 + dot.phase) * dot.wobble * profile.wobble;
      const x = wrap(xBase + wobble, -8, state.width + 8);
      const drift = time * dot.drift * driftScale * profile.direction;
      const y = wrap(dot.y * state.height + drift, -8, state.height + 8);
      const pulse = 0.78 + 0.22 * Math.sin(time * dot.speed * 1.05 + dot.phase);
      const alpha = alphaScale * pulse;
      const radius = dot.size * profile.size;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${(alpha * profile.glow).toFixed(3)})`;
      ctx.arc(x, y, radius * 2.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function getDotProfile() {
    if (state.theme === 'space') {
      return { alpha: 0.82, drift: 44, wobble: 1.08, direction: 1, size: 1.08, glow: 0.44 };
    }

    if (state.theme === 'underwater') {
      return { alpha: 0.24, drift: 9.8, wobble: 0.9, direction: -1, size: 1.16, glow: 0.24 };
    }

    if (state.theme === 'bubbles') {
      return { alpha: 0.2, drift: 10.5, wobble: 0.85, direction: -1, size: 1.12, glow: 0.22 };
    }

    return { alpha: 0.2, drift: 6.5, wobble: 0.7, direction: 1, size: 1.0, glow: 0.2 };
  }

  function drawParticles() {
    for (let i = 0; i < state.particles.length; i += 1) {
      const particle = state.particles[i];
      const fade = 1 - (particle.age / particle.life);
      const alpha = clamp01(fade * 0.92);

      if (particle.trail) {
        if (particle.trailHead) {
          const outer = particle.size * (state.reduceMotion ? 1.55 : 1.9);
          const core = particle.size * 0.48;

          ctx.beginPath();
          ctx.fillStyle = withAlpha(particle.color, alpha * 0.34);
          ctx.arc(particle.x, particle.y, outer, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = withAlpha(particle.color, alpha * 0.96);
          ctx.arc(particle.x, particle.y, core, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = withAlpha('#ffffff', alpha * 0.85);
          ctx.arc(particle.x, particle.y, core * 0.42, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        const outer = particle.size * (state.reduceMotion ? 1.45 : 1.8);
        const core = particle.size * 0.52;
        ctx.beginPath();
        ctx.fillStyle = withAlpha(particle.color, alpha * 0.3);
        ctx.arc(particle.x, particle.y, outer, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = withAlpha(particle.color, alpha * 0.95);
        ctx.arc(particle.x, particle.y, core, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      if (particle.theme === 'bubbles') {
        ctx.beginPath();
        ctx.fillStyle = withAlpha(particle.color, alpha * 0.35);
        ctx.strokeStyle = withAlpha(particle.color, alpha * 0.8);
        ctx.lineWidth = 1.2;
        ctx.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        continue;
      }

      if (particle.theme === 'space') {
        const tailX = particle.x - particle.vx * 0.03;
        const tailY = particle.y - particle.vy * 0.03;
        ctx.strokeStyle = withAlpha(particle.color, alpha * 0.55);
        ctx.lineWidth = Math.max(1, particle.size * 0.3);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = withAlpha(particle.color, alpha);
        ctx.arc(particle.x, particle.y, particle.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      if (particle.theme === 'underwater') {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = withAlpha(particle.color, alpha * 0.8);
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size * 0.95, particle.size * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = withAlpha(particle.color, alpha);
      ctx.fillRect(-particle.size * 0.42, -particle.size * 0.42, particle.size * 0.84, particle.size * 0.84);
      ctx.restore();
    }
  }

  function drawGlyphs() {
    for (let i = 0; i < state.glyphs.length; i += 1) {
      const glyph = state.glyphs[i];
      const alpha = clamp01(1 - glyph.age / glyph.life);
      const isAsciiGlyph = glyph.isAsciiGlyph !== false;
      const sizeNow = isAsciiGlyph ? glyph.size : glyph.size * (0.94 + alpha * 0.06);

      ctx.save();
      ctx.lineWidth = Math.max(3, sizeNow * 0.1);

      if (isAsciiGlyph) {
        ctx.font = `${Math.round(sizeNow)}px "Trebuchet MS", "Segoe UI", sans-serif`;
        ctx.strokeStyle = withAlpha(glyph.stroke, alpha * 0.95);
        ctx.strokeText(glyph.text, glyph.x, glyph.y);
        ctx.shadowBlur = state.reduceMotion ? 0 : 14;
        ctx.shadowColor = withAlpha(glyph.glow || glyph.color, alpha * 0.45);
        ctx.fillStyle = withAlpha(glyph.color, alpha);
        ctx.fillText(glyph.text, glyph.x, glyph.y);
      } else {
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = state.reduceMotion ? 0 : 8;
        ctx.shadowColor = withAlpha(glyph.glow || '#ffffff', 0.3);
        if (glyph.sprite) {
          const side = sizeNow * 1.9;
          ctx.drawImage(glyph.sprite, glyph.x - side / 2, glyph.y - side / 2, side, side);
        } else {
          ctx.font = `${Math.round(sizeNow)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Trebuchet MS", "Segoe UI", sans-serif`;
          ctx.fillStyle = glyph.color;
          ctx.fillText(glyph.text, glyph.x, glyph.y);
        }
      }

      ctx.restore();
    }
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffledCopy(list) {
    const copy = list.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const saved = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = saved;
    }
    return copy;
  }

  function clamp01(value) {
    if (value < 0) {
      return 0;
    }
    if (value > 1) {
      return 1;
    }
    return value;
  }

  function clampChannel(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function wrap(value, min, max) {
    const range = max - min;
    if (range <= 0) {
      return min;
    }

    let wrapped = (value - min) % range;
    if (wrapped < 0) {
      wrapped += range;
    }
    return wrapped + min;
  }

  function withAlpha(inputColor, alpha) {
    if (inputColor.startsWith('rgba')) {
      return inputColor.replace(/,\s*([0-9.]+)\)/, `, ${clamp01(alpha).toFixed(3)})`);
    }

    if (inputColor.startsWith('rgb(')) {
      return inputColor.replace('rgb(', 'rgba(').replace(')', `, ${clamp01(alpha).toFixed(3)})`);
    }

    if (inputColor.startsWith('#')) {
      const rgb = hexToRgb(inputColor);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp01(alpha).toFixed(3)})`;
    }

    return inputColor;
  }

  function getTrailColorBySpeed(theme, flow) {
    const palette = TRAIL_COLORS[theme] || TRAIL_COLORS.confetti;
    const base = pick(palette);
    const clampedFlow = Math.max(0, Math.min(1.5, flow));
    const hueShift = -4 + clampedFlow * 11 + (Math.random() - 0.5) * 4;
    return shiftHexHue(base, hueShift);
  }

  function shiftHexHue(color, degrees) {
    if (typeof color !== 'string' || !color.startsWith('#')) {
      return color;
    }

    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const h = (hsl.h + degrees + 360) % 360;
    const shifted = hslToRgb(h, hsl.s, hsl.l);
    return rgbToHex(shifted.r, shifted.g, shifted.b);
  }

  function rgbToHsl(r, g, b) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));

      if (max === rn) {
        h = 60 * (((gn - bn) / delta) % 6);
      } else if (max === gn) {
        h = 60 * (((bn - rn) / delta) + 2);
      } else {
        h = 60 * (((rn - gn) / delta) + 4);
      }
    }

    if (h < 0) {
      h += 360;
    }

    return { h, s, l };
  }

  function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let rn = 0;
    let gn = 0;
    let bn = 0;

    if (h < 60) {
      rn = c; gn = x; bn = 0;
    } else if (h < 120) {
      rn = x; gn = c; bn = 0;
    } else if (h < 180) {
      rn = 0; gn = c; bn = x;
    } else if (h < 240) {
      rn = 0; gn = x; bn = c;
    } else if (h < 300) {
      rn = x; gn = 0; bn = c;
    } else {
      rn = c; gn = 0; bn = x;
    }

    return {
      r: clampChannel((rn + m) * 255),
      g: clampChannel((gn + m) * 255),
      b: clampChannel((bn + m) * 255)
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
      ? `${normalized[0]}${normalized[0]}${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}`
      : normalized;

    const intValue = Number.parseInt(full, 16);
    return {
      r: (intValue >> 16) & 255,
      g: (intValue >> 8) & 255,
      b: intValue & 255
    };
  }
})();
