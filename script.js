// ─── footer year ───
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── carousel navigation ───
const track = document.getElementById('track');
if (track) {
  const buttons = document.querySelectorAll('.ctrl');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      const card = track.querySelector('.card');
      if (!card) return;
      const gap = parseInt(getComputedStyle(track).gap) || 18;
      const step = card.offsetWidth + gap;
      track.scrollBy({ left: step * dir, behavior: 'smooth' });
    });
  });

  // keyboard nav when track is focused or hovered
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const card = track.querySelector('.card');
      const gap = parseInt(getComputedStyle(track).gap) || 18;
      const step = card.offsetWidth + gap;
      track.scrollBy({ left: step * dir, behavior: 'smooth' });
    }
  });
}
