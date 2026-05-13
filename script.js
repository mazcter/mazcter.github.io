// ─── footer year ───
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── carousel navigation ───
const track = document.getElementById('track');
if (track) {
  const buttons = document.querySelectorAll('.ctrl');
  const cards = track.querySelectorAll('.card');

  // hide arrow controls when there's nothing to scroll
  if (cards.length <= 1) {
    document.querySelectorAll('.controls').forEach(c => c.style.display = 'none');
  }

  const scrollByCard = (dir) => {
    const card = track.querySelector('.card');
    if (!card) return;
    const gap = parseInt(getComputedStyle(track).gap) || 18;
    const step = card.offsetWidth + gap;
    track.scrollBy({ left: step * dir, behavior: 'smooth' });
  };
  buttons.forEach(btn => btn.addEventListener('click', () => scrollByCard(Number(btn.dataset.dir))));

  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByCard(-1); }
  });
}

// ─── gaussian neural-network particle field ───
// nodes are positioned via Box-Muller (true gaussian distribution),
// drift with gaussian velocities, twinkle on independent phases,
// and connect with thin edges when within proximity threshold —
// the result reads as a slowly-firing neural network.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'noise-bg';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h, dpr, particles = [];
  let mouseX = null, mouseY = null;

  // Box-Muller transform → standard normal
  const gauss = (mean = 0, std = 1) => {
    let u = 1 - Math.random();
    let v = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const seed = () => {
    // fewer particles than before since each draws edges (O(n²) check)
    const count = Math.min(140, Math.floor((w * h) / 14000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: gauss(w / 2, w / 2.6),
        y: gauss(h / 2, h / 2.6),
        vx: gauss(0, 0.11),
        vy: gauss(0, 0.11),
        r: Math.max(0.35, Math.abs(gauss(0.8, 0.6))),
        a: Math.max(0.12, Math.min(0.6, Math.abs(gauss(0.32, 0.18)))),
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.4 + Math.random() * 0.8,
        accent: Math.random() < 0.10
      });
    }
  };

  const init = () => { resize(); seed(); };
  init();
  window.addEventListener('resize', init);

  // cursor repulsion
  window.addEventListener('pointermove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('pointerleave', () => { mouseX = mouseY = null; });

  // connection threshold (squared for cheap comparison)
  const LINK_DIST = 118;
  const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

  const animate = (t) => {
    ctx.clearRect(0, 0, w, h);
    const time = t * 0.001;

    // 1) update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (mouseX !== null) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
          const f = (1 - d2 / 14400) * 0.6;
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    }

    // 2) draw connecting edges between nearby nodes (the neural-net look)
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST_SQ) {
          // alpha falls off with distance — close edges brighter, far ones ghostly
          const alpha = (1 - d2 / LINK_DIST_SQ) * 0.18;
          ctx.strokeStyle = `rgba(235, 231, 223, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // 3) draw nodes on top of edges
    for (const p of particles) {
      const twinkle = (Math.sin(time * p.twinkleSpeed + p.phase) + 1) * 0.5;
      const alpha = p.a * (0.4 + 0.6 * twinkle);

      ctx.fillStyle = p.accent
        ? `rgba(212, 165, 116, ${alpha})`
        : `rgba(235, 231, 223, ${alpha})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
})();
