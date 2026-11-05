/* FACU XVIII — Vanilla JavaScript. No dependencies, no build step. */
(() => {
  'use strict';

  const EVENT = Object.freeze({
    start: new Date('2026-11-07T22:00:00-03:00').getTime(),
    end: new Date('2026-11-08T05:00:00-03:00').getTime(),
    venue: 'Complejo Deportivo SITRAVI, Tucumán, Argentina'
  });
  const $ = (selector) => document.querySelector(selector);
  const root = document.documentElement;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { paused: motionPreference.matches, visible: !document.hidden, heroVisible: true, boost: 0, sound: false };
  let toastTimeout;

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => element.classList.remove('visible'), 3200);
  }

  // All event boundaries are explicit Argentina offsets, independent of visitor time zone.
  function updateCountdown() {
    const now = Date.now();
    const remaining = Math.max(0, EVENT.start - now);
    const units = [86400000, 3600000, 60000, 1000];
    const values = units.map((unit, index) => Math.floor(remaining / unit) % (index === 0 ? Infinity : index === 1 ? 24 : 60));
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
      const text = String(values[index]).padStart(2, '0');
      if ($(`#${id}`).textContent !== text) $(`#${id}`).textContent = text;
    });
    if (now >= EVENT.end) {
      $('#count-caption').textContent = 'La misión se convirtió en una historia. Gracias por ser parte.';
      $('#count-status').textContent = 'MISIÓN CUMPLIDA / GRACIAS, BRIGADA';
    } else if (now >= EVENT.start) {
      $('#count-caption').textContent = '¡Llegó el momento! La brigada ya está de fiesta.';
      $('#count-status').textContent = 'MISIÓN EN CURSO / NOS VEMOS EN SITRAVI';
    }
  }
  updateCountdown();
  setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);

  // Content is visible by default; progressively enhance only when observers exist.
  if ('IntersectionObserver' in window) {
    root.classList.add('js-motion');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  }

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
          copied = true;
        } else {
          const field = document.createElement('textarea');
          field.value = value;
          field.setAttribute('readonly', '');
          field.style.cssText = 'position:fixed;opacity:0;left:-9999px;';
          document.body.append(field);
          field.select();
          try { copied = document.execCommand('copy'); } finally { field.remove(); }
          button.focus({ preventScroll: true });
        }
      } catch { copied = false; }
      if (copied) {
        button.innerHTML = '¡COPIADO! <span aria-hidden="true">✓</span>';
        toast(`${value === 'Ramos-02' ? 'Alias' : 'CBU'} copiado. ¡Gracias por el impulso!`);
        setTimeout(() => { button.innerHTML = 'COPIAR <span aria-hidden="true">⧉</span>'; }, 2200);
      } else {
        toast(`Copiá manualmente: ${value}`);
      }
    });
  });

  $('#calendar-button').addEventListener('click', () => {
    const calendar = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FACU XVIII//Spiral Birthday//ES',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:facu-xviii-20261107@invitation.local', 'DTSTAMP:20261105T000000Z',
      'DTSTART:20261108T010000Z', 'DTEND:20261108T080000Z',
      'SUMMARY:Facu XVIII — 18 años. Cero límites.',
      'LOCATION:Complejo Deportivo SITRAVI\\, Tucumán\\, Argentina',
      'DESCRIPTION:¡Sumate a la brigada!\\nLook libre\\, elegante sport o disfraz.\\nTraé tu bebida.\\nUbicación: https://www.google.com/maps?cid=15262597743607182158',
      'URL:https://www.google.com/maps?cid=15262597743607182158',
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY',
      'DESCRIPTION:¡Hoy es la fiesta de Facu! Traé tu bebida.', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR', ''
    ].map((line) => {
      // RFC 5545: fold long content lines without splitting a UTF-8 character.
      let folded = '', segment = '', bytes = 0;
      for (const character of line) {
        const length = new TextEncoder().encode(character).length;
        if (bytes + length > 73) { folded += segment + '\r\n '; segment = ''; bytes = 1; }
        segment += character;
        bytes += length;
      }
      return folded + segment;
    }).join('\r\n');
    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'facu-xviii.ics';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('Abrí el archivo descargado para agregar la misión a tu calendario.');
  });

  // A quiet, original synthesizer ambience. Starts only after an explicit click.
  let audioContext, masterGain, soundInterval;
  let noteIndex = 0;
  const melody = [130.81, 196, 261.63, 311.13, 174.61, 261.63, 349.23, 392];
  function playNote(frequency, duration = 0.9, volume = 0.13) {
    if (!audioContext || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(volume, now + 0.035);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(envelope).connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  function scheduleSound() {
    clearInterval(soundInterval);
    soundInterval = setInterval(() => {
      if (!state.sound || !state.visible) return;
      playNote(melody[noteIndex % melody.length]);
      if (noteIndex % 4 === 0) playNote(melody[noteIndex % melody.length] / 2, 1.6, 0.17);
      noteIndex++;
    }, 310);
  }
  $('#sound-toggle').addEventListener('click', async () => {
    const button = $('#sound-toggle');
    button.disabled = true;
    try {
      if (!state.sound) {
        const AudioEngine = window.AudioContext || window.webkitAudioContext;
        if (!AudioEngine) { toast('El ambiente sonoro no está disponible en este navegador.'); return; }
        if (!audioContext) {
          audioContext = new AudioEngine();
          masterGain = audioContext.createGain();
          masterGain.gain.value = 0.23;
          masterGain.connect(audioContext.destination);
        }
        await audioContext.resume();
        state.sound = true;
        scheduleSound();
        playNote(130.81);
      } else {
        state.sound = false;
        clearInterval(soundInterval);
        await audioContext.suspend();
      }
      root.classList.toggle('sound-on', state.sound);
      button.setAttribute('aria-pressed', String(state.sound));
      button.setAttribute('aria-label', state.sound ? 'Desactivar ambiente sonoro' : 'Activar ambiente sonoro sintetizado');
      $('#sound-label').textContent = state.sound ? 'SONIDO ON' : 'SONIDO OFF';
    } catch { toast('No pudimos iniciar el sonido. Probá nuevamente.'); }
    finally { button.disabled = false; }
  });

  const hero = $('.hero');
  const canvas = $('#spiral-canvas');
  const context = canvas.getContext('2d');
  let width = 0, height = 0, frame = 0, lastTick = 0, time = 0;
  let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0, scrollY = 0;
  const particles = [];
  const isFinePointer = matchMedia('(hover: hover) and (pointer: fine)');

  function sizeCanvas() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles.length = 0;
    const amount = width < 760 ? 25 : 55;
    for (let i = 0; i < amount; i++) {
      particles.push({ x: Math.random() * width, y: Math.random() * height,
        speed: 0.2 + Math.random() * 0.8, size: 0.5 + Math.random() * 1.5,
        opacity: 0.15 + Math.random() * 0.5, phase: Math.random() * 6.28 });
    }
  }
  function draw(delta) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const step = delta / 16.67;
    const boost = state.boost;
    particles.forEach((particle) => {
      if (!state.paused) {
        particle.y -= particle.speed * step * (1 + boost * 5);
        particle.x += Math.sin(time * 0.001 + particle.phase) * 0.25 * step;
        if (particle.y < -5) { particle.y = height + 5; particle.x = Math.random() * width; }
      }
      const opacity = particle.opacity * (0.65 + Math.sin(time * 0.002 + particle.phase) * 0.35);
      context.fillStyle = `rgba(255,${Math.round(105 + boost * 100)},50,${opacity})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * (1 + boost * 0.5), 0, Math.PI * 2);
      context.fill();
    });
    if (boost > 0.025) {
      const x = width * (width < 760 ? 0.68 : 0.73), y = height * 0.4;
      context.save();
      context.translate(x, y);
      context.scale(1, 0.62);
      for (let i = 0; i < 6; i++) {
        const phase = (time * 0.00035 + i / 6) % 1;
        const radius = phase * Math.max(width, height) * 0.8;
        context.strokeStyle = `rgba(186,255,92,${(1 - phase) * boost * 0.7})`;
        context.lineWidth = 1 + (1 - phase) * 3;
        context.beginPath();
        context.arc(0, 0, radius, time * 0.002 + i, time * 0.002 + i + Math.PI * 1.65);
        context.stroke();
      }
      context.restore();
    }
  }
  function animate(timestamp) {
    frame = 0;
    if (state.paused || !state.visible || !state.heroVisible) return;
    const elapsed = timestamp - lastTick;
    const minimum = width < 760 ? 32 : 16;
    if (elapsed >= minimum) {
      const delta = Math.min(elapsed || 16, 60);
      lastTick = timestamp;
      time += delta;
      state.boost = Math.max(0, state.boost - delta / 7000);
      $('#power-fill').style.width = `${18 + state.boost * 82}%`;
      root.classList.toggle('power-active', state.boost > 0.7);
      currentX += (pointerX - currentX) * 0.06;
      currentY += (pointerY + scrollY - currentY) * 0.06;
      if (isFinePointer.matches) {
        hero.style.setProperty('--art-x', `${currentX.toFixed(2)}px`);
        hero.style.setProperty('--art-y', `${currentY.toFixed(2)}px`);
      }
      draw(delta);
    }
    frame = requestAnimationFrame(animate);
  }
  function runAnimation() {
    if (!frame && !state.paused && state.visible && state.heroVisible) {
      lastTick = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }
  function syncMotion() {
    root.classList.toggle('fx-paused', state.paused);
    $('#motion-toggle').setAttribute('aria-pressed', String(state.paused));
    $('#motion-toggle').setAttribute('aria-label', state.paused ? 'Reanudar animaciones' : 'Pausar animaciones');
    $('#motion-label').textContent = state.paused ? 'ACTIVAR FX' : 'PAUSAR FX';
    $('#motion-icon').textContent = state.paused ? '▷' : 'Ⅱ';
    if (state.paused) {
      cancelAnimationFrame(frame); frame = 0;
      state.boost = 0;
      root.classList.remove('power-active');
      $('#power-fill').style.width = '18%';
      draw(0);
    } else runAnimation();
  }
  $('#motion-toggle').addEventListener('click', () => {
    state.paused = !state.paused;
    syncMotion();
  });
  motionPreference.addEventListener('change', (event) => { state.paused = event.matches; syncMotion(); });

  hero.addEventListener('pointermove', (event) => {
    if (state.paused || !isFinePointer.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / width - 0.5) * -20;
    pointerY = ((event.clientY - bounds.top) / height - 0.5) * -14;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  window.addEventListener('scroll', () => { if (state.heroVisible) scrollY = Math.min(window.scrollY, height) * 0.055; }, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      state.heroVisible = entry.isIntersecting;
      if (state.heroVisible) runAnimation();
      else { cancelAnimationFrame(frame); frame = 0; }
    }).observe(hero);
  }
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { sizeCanvas(); if (state.paused) draw(0); }, 120);
  }, { passive: true });
  document.addEventListener('visibilitychange', async () => {
    state.visible = !document.hidden;
    if (!state.visible) {
      cancelAnimationFrame(frame); frame = 0;
      if (audioContext?.state === 'running') await audioContext.suspend().catch(() => {});
    } else {
      updateCountdown(); runAnimation();
      if (state.sound) await audioContext?.resume().catch(() => {});
    }
  });
  $('#power-trigger').addEventListener('click', () => {
    if (state.paused) { toast('¡Poder espiral al máximo! Los efectos están pausados.'); return; }
    state.boost = 1;
    runAnimation();
    if (state.sound) {
      [261.63, 392, 523.25].forEach((frequency, index) => setTimeout(() => playNote(frequency, 0.6, 0.16), index * 90));
    }
    toast('¡GIGA DRILL BREAK! Tu poder atraviesa el cielo.');
  });
  sizeCanvas();
  syncMotion();
})();
