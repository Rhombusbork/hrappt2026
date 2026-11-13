// 연출 B4: "필름 돌리기"를 누르면 활동 사진이 필름처럼 빠르게 지나간 뒤 "20기를 맞혀라"가 나온다.
(window.HRA_EFFECTS ||= {}).film = {
  enter(slide) {
    this.running = false;
    this.timer = undefined;
    return () => clearTimeout(this.timer);
  },
  cue(slide, api) {
    if (!slide.classList.contains('awaiting-cue')) return false;
    if (this.running) return true;
    this.running = true;
    if (api.reduced) {
      api.reveal();
      return true;
    }
    const photos = HRA_DATA.filmPhotos;
    const reel = document.createElement('div');
    reel.className = 'film-reel';
    reel.setAttribute('aria-hidden', 'true');
    for (const direction of ['forward', 'backward']) {
      const strip = document.createElement('div');
      strip.className = 'film-strip film-' + direction;
      const offset = direction === 'forward' ? 0 : Math.floor(photos.length / 2);
      for (let i = 0; i < 26; i++) {
        const frame = document.createElement('img');
        frame.src = photos[(i + offset) % photos.length];
        frame.alt = '';
        strip.append(frame);
      }
      reel.append(strip);
    }
    slide.classList.add('film-rolling');
    slide.append(reel);
    this.timer = setTimeout(() => {
      slide.classList.remove('film-rolling');
      api.reveal();
    }, 3300);
    return true;
  },
};
