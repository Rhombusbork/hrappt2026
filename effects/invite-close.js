// 연출 A1: 입학 축하에서 넘어오면 펼쳐진 양피지가 접히며 닫히고, 연회장이 밝아진 뒤 학생증이 나온다.
(window.HRA_EFFECTS ||= {})['invite-close'] = {
  enter(slide, api) {
    if (api.from !== 'welcome' || api.reduced) return;
    const cover = document.createElement('div');
    cover.className = 'invite-cover';
    cover.setAttribute('aria-hidden', 'true');
    cover.innerHTML = '<div class="invite-letter"><i class="invite-flap invite-flap-top"><b>Welcome to HRAWarts</b></i><i class="invite-flap invite-flap-bottom"></i><img class="invite-seal" src="./art/wax-seal.webp" alt=""></div>';
    slide.classList.add('invite-closing');
    slide.append(cover);
    const timer = setTimeout(() => {
      cover.remove();
      slide.classList.remove('invite-closing');
    }, 2800);
    return () => clearTimeout(timer);
  },
};
