// ─── footer year ───
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
 
// ─── carousel navigation ───
const track = document.getElementById('track');
if (track) {
  const buttons = document.querySelectorAll('.ctrl');
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
 
// ─── gaussian particle field ───
// particles distributed via Box-Muller (true normal distribution),
// drifting with gaussian velocities + sinusoidal twinkle.
(() => {
  // respect reduced-motion users
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
    // density scaled to viewport, capped to keep things buttery
    const count = Math.min(260, Math.floor((w * h) / 8500));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        // gaussian-distributed position around viewport center
        x: gauss(w / 2, w / 2.6),
        y: gauss(h / 2, h / 2.6),
        // gaussian velocity → slow drift
        vx: gauss(0, 0.12),
        vy: gauss(0, 0.12),
        // gaussian radius, clamped positive
        r: Math.max(0.25, Math.abs(gauss(0.7, 0.55))),
        // base opacity
        a: Math.max(0.08, Math.min(0.55, Math.abs(gauss(0.28, 0.18)))),
        // twinkle phase
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.4 + Math.random() * 0.8,
        // ~12% chance of being an accent particle
        accent: Math.random() < 0.12
      });
    }
  };
 
  const init = () => { resize(); seed(); };
  init();
  window.addEventListener('resize', init);
 
  // gentle parallax: particles nudged away from cursor
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener('pointerleave', () => { mouseX = mouseY = null; });
 
  const animate = (t) => {
    ctx.clearRect(0, 0, w, h);
    const time = t * 0.001;
 
    for (const p of particles) {
      // drift
      p.x += p.vx;
      p.y += p.vy;
 
      // cursor repulsion (subtle)
      if (mouseX !== null) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) { // 120px radius
          const f = (1 - d2 / 14400) * 0.6;
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }
 
      // wrap edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
 
      // sinusoidal twinkle
      const twinkle = (Math.sin(time * p.twinkleSpeed + p.phase) + 1) * 0.5;
      const alpha = p.a * (0.35 + 0.65 * twinkle);
 
      ctx.fillStyle = p.accent
        ? `rgba(212, 165, 116, ${alpha})`   // --accent (warm amber)
        : `rgba(235, 231, 223, ${alpha})`;  // --ink (off-white)
 
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
 
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
})();
