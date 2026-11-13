// 연출 B5: 3부 시작. 닫힌 두 짝 문이 "문 열기"에 안쪽으로 열리고, 그 뒤의 볼룸이 빛과 함께 드러난 뒤 제목이 나온다.
(window.HRA_EFFECTS ||= {}).door = {
  enter(slide) {
    this.opening = false;
    const doors = document.createElement('div');
    doors.className = 'door-frame';
    doors.setAttribute('aria-hidden', 'true');
    doors.innerHTML = '<div class="door-leaf door-left"><i class="door-handle"></i></div><div class="door-leaf door-right"><i class="door-handle"></i></div><div class="door-light"></div>';
    slide.append(doors);
    return () => clearTimeout(this.timer);
  },
  cue(slide, api) {
    if (!slide.classList.contains('awaiting-cue')) return false;
    if (this.opening) return true;
    this.opening = true;
    slide.classList.add('doors-open');
    this.timer = setTimeout(() => api.reveal(), api.reduced ? 0 : 1700);
    return true;
  },
};
