// 연출 B1: 배너 장면이 서서히 검게 가라앉는다.
(window.HRA_EFFECTS ||= {}).blackout = {
  enter(slide) {
    const veil = document.createElement('div');
    veil.className = 'blackout-veil';
    slide.append(veil);
  },
};
