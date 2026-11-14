// C02 입학 축하: 실사 부엉이가 말린 양피지를 쥐고 날아와 멈추고, 양피지가 위에서 아래로 천천히 펼쳐진다.
// 다음 버튼을 누르면 양피지가 말려 올라가고 부엉이가 들고 날아간 뒤 3번으로 넘어간다.
// 콘티: 작업계획/콘티/C02_입학축하_부엉이와_양피지.md

// 실사 부엉이(scenes/p02.webp에서 오려 낸 날개 셋 + 몸통). 수상자 장(awards.js)에서도 쓴다.
window.HRA_OWL = {
  create() {
    const flyer = document.createElement('div');
    flyer.className = 'owl-flyer';
    flyer.setAttribute('aria-hidden', 'true');
    const part = name => `<img class="owl-part owl-${name}" src="./assets/cuts/C02/owl-${name}.webp" alt="" draggable="false">`;
    flyer.innerHTML = `<div class="owl-bob"><div class="owl-rig">${part('wing-low')}${part('wing-left')}${part('wing-right')}<div class="owl-hold"></div>${part('body')}</div></div>`;
    return flyer;
  },
};

// 두루마리 위아래 막대(수상자 장에서 쓴다).
window.HRA_SCROLL = {
  wrap(paper, className) {
    const wrap = document.createElement('div');
    wrap.className = className;
    paper.before(wrap);
    const rod = position => {
      const el = document.createElement('i');
      el.className = 'scroll-rod scroll-rod-' + position;
      return el;
    };
    wrap.append(rod('top'), paper, rod('bottom'));
    return wrap;
  },
};

(window.HRA_EFFECTS ||= {})['owl-letter'] = {
  enter(slide, api) {
    const text = slide.querySelector('.welcome-scroll');
    if (!text) return;
    this.slide = slide;
    this.api = api;
    this.timers = [];
    this.state = 'arriving';

    const owl = HRA_OWL.create();
    const scroll = document.createElement('div');
    scroll.className = 'owl-scroll';
    scroll.innerHTML = '<i class="scroll-rod scroll-rod-top"></i><div class="scroll-paper"></div><i class="scroll-roll"></i>';
    scroll.querySelector('.scroll-paper').append(text);
    owl.querySelector('.owl-hold').append(scroll);
    slide.append(owl);

    if (api.from === 'cover' && !api.reduced) {
      const light = document.createElement('div');
      light.className = 'from-cover-light';
      slide.append(light);
      slide.classList.add('from-cover');
    }
    if (api.reduced) {
      this.settle();
    } else {
      slide.classList.add('owl-arriving');
      this.later(3900, () => slide.classList.add('owl-hovering'));
      this.later(4300, () => slide.classList.add('owl-unrolling'));
      this.later(7700, () => this.settle());
    }
    return () => this.timers.forEach(clearTimeout);
  },
  later(ms, job) {
    this.timers.push(setTimeout(job, ms));
  },
  // 들어온 뒤의 연출을 끝 상태(펼쳐진 양피지, 정지 비행)로 맞춘다.
  settle() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.slide.classList.remove('owl-arriving', 'owl-unrolling');
    this.slide.classList.add('owl-hovering', 'owl-open');
    this.state = 'open';
  },
  pending() {
    return this.state !== 'leaving';
  },
  cue(slide, api) {
    if (this.state === 'arriving') {
      this.settle();
      return true;
    }
    if (this.state !== 'open') return true;
    this.state = 'leaving';
    if (api.reduced) {
      api.next();
      return true;
    }
    slide.classList.add('owl-rolling');
    this.later(1200, () => slide.classList.add('owl-departing'));
    this.later(2600, () => api.next());
    return true;
  },
};
