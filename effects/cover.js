// 연출 A3: 표지. 호수 위의 배들이 동동 떠 있다가, "성으로 들어가기"에 검은 호수를 지나 성 안으로 들어간다.
(window.HRA_EFFECTS ||= {}).cover = {
  boats: [
    { left: 14, top: 76, width: 9, delay: 0 },
    { left: 31, top: 83, width: 7.5, delay: -1.1 },
    { left: 47, top: 74, width: 5.5, delay: -2.2 },
    { left: 60, top: 80, width: 6.5, delay: -0.6 },
  ],
  enter(slide) {
    this.entering = false;
    const lake = document.createElement('div');
    lake.className = 'cover-lake';
    lake.setAttribute('aria-hidden', 'true');
    for (const boat of this.boats) {
      const el = document.createElement('div');
      el.className = 'cover-boat';
      el.style.cssText = `left:${boat.left}%;top:${boat.top}%;width:${boat.width}cqw;animation-delay:${boat.delay}s`;
      el.innerHTML = `<svg viewBox="0 0 120 70"><defs><radialGradient id="lantern-glow"><stop offset="0" stop-color="#fff3c4"/><stop offset=".35" stop-color="#ffc35a" stop-opacity=".8"/><stop offset="1" stop-color="#ff9d2e" stop-opacity="0"/></radialGradient></defs>
  <ellipse class="boat-reflection" cx="60" cy="62" rx="34" ry="5" fill="#ffc35a" opacity=".35"/>
  <path d="M60 46 V14" stroke="#1a120c" stroke-width="2.5"/>
  <path d="M38 44 Q60 18 82 44 Z" fill="#2a1a12" stroke="#b78a45" stroke-width="1.2"/>
  <path d="M4 42 Q60 52 116 42 L104 54 Q60 62 16 54 Z" fill="#140d09" stroke="#c99b52" stroke-width="1.5"/>
  <circle class="boat-lantern" cx="60" cy="12" r="14" fill="url(#lantern-glow)"/>
  <rect x="56.5" y="8" width="7" height="9" rx="1.5" fill="#ffd77a" stroke="#6b4512"/>
</svg>`;
      lake.append(el);
    }
    const light = document.createElement('div');
    light.className = 'cover-light';
    slide.append(lake, light);
    return () => clearTimeout(this.timer);
  },
  cue(slide, api) {
    if (this.entering) return true;
    this.entering = true;
    if (api.reduced) {
      api.next();
      return true;
    }
    slide.classList.add('entering');
    this.timer = setTimeout(() => api.next(), 2900);
    return true;
  },
};
