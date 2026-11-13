// 연출 B2: 밤의 성 위로 금빛 별빛이 천천히 내린다.
(window.HRA_EFFECTS ||= {}).starfall = {
  enter(slide, api) {
    const canvas = document.createElement('canvas');
    canvas.className = 'starfall';
    canvas.setAttribute('aria-hidden', 'true');
    slide.prepend(canvas);
    const context = canvas.getContext('2d');
    const ratio = Math.min(devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.6 + Math.random() ** 2 * 2.2,
      speed: 0.012 + Math.random() * 0.035,
      sway: Math.random() * Math.PI * 2,
      twinkle: Math.random() * Math.PI * 2,
    }));
    const draw = time => {
      context.clearRect(0, 0, width, height);
      const unit = width / 1000;
      for (const star of stars) {
        const glow = 0.55 + 0.45 * Math.sin(time / 500 + star.twinkle);
        const x = (star.x + Math.sin(time / 2400 + star.sway) * 0.006) * width;
        const y = star.y * height;
        const radius = star.size * unit;
        const halo = context.createRadialGradient(x, y, 0, x, y, radius * 5);
        halo.addColorStop(0, `rgba(255, 223, 150, ${0.42 * glow})`);
        halo.addColorStop(1, 'rgba(255, 200, 110, 0)');
        context.fillStyle = halo;
        context.fillRect(x - radius * 5, y - radius * 5, radius * 10, radius * 10);
        context.fillStyle = `rgba(255, 240, 200, ${0.6 + 0.4 * glow})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    };
    let frame;
    let last = performance.now();
    const tick = now => {
      const elapsed = Math.min(now - last, 60) / 1000;
      last = now;
      for (const star of stars) {
        star.y += star.speed * elapsed;
        if (star.y > 1.03) {
          star.y = -0.03;
          star.x = Math.random();
        }
      }
      draw(now);
      frame = requestAnimationFrame(tick);
    };
    if (api.reduced) draw(0);
    else frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  },
};
