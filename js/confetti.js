/**
 * Lightweight Canvas Confetti
 */

function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
  const pieces = [];
  const pieceCount = 120;

  for (let i = 0; i < pieceCount; i++) {
    pieces.push({
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 50,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -16 - 6,
      gravity: 0.4,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animationFrame;
  const startTime = Date.now();
  const duration = 4000; // 4 seconds

  function render() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    let activePieces = 0;

    for (const p of pieces) {
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.vRotation;

      if (elapsed > duration - 1000) {
        p.opacity = Math.max(0, (duration - elapsed) / 1000);
      }

      if (p.y < height && p.opacity > 0) {
        activePieces++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    }

    if (elapsed < duration && activePieces > 0) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }

  animationFrame = requestAnimationFrame(render);
}

window.triggerConfetti = triggerConfetti;
