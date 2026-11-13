// 연출 A2·A4: 부엉이가 날갯짓하며 날아와 인장을 열고, 양피지가 촤라락 펼쳐진다.
// 부엉이 그림(HRA_OWL)은 수상자 장(awards.js)에서도 쓴다.
window.HRA_OWL = (() => {
  let count = 0;
  const wing = 'M-12 -10 C-30 -40 -72 -46 -98 -26 C-84 -24 -78 -18 -84 -8 C-70 -12 -64 -6 -68 4 C-54 -2 -46 4 -48 14 C-36 6 -24 10 -12 12 Z';
  const feathers = 'M-30 -20 L-74 -26 M-28 -8 L-66 -10 M-26 2 L-52 4';
  return {
    // carry가 true면 발에 두루마리 묶음을 쥐고 있다.
    create({ carry = false } = {}) {
      const id = 'owl' + ++count;
      const holder = document.createElement('div');
      holder.innerHTML = `<svg class="owl" viewBox="-100 -70 200 150" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-wing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#c9c2b4"/></linearGradient>
    <radialGradient id="${id}-body" cx=".45" cy=".3" r=".8"><stop offset="0" stop-color="#fffefa"/><stop offset="1" stop-color="#bdb4a3"/></radialGradient>
  </defs>
  <g class="owl-wing owl-wing-left"><path d="${wing}" fill="url(#${id}-wing)" stroke="#d8b06a" stroke-width="1.2"/><path d="${feathers}" stroke="#a89c86" stroke-width="1.4" stroke-linecap="round" fill="none"/></g>
  <g class="owl-wing owl-wing-right"><g transform="scale(-1 1)"><path d="${wing}" fill="url(#${id}-wing)" stroke="#d8b06a" stroke-width="1.2"/><path d="${feathers}" stroke="#a89c86" stroke-width="1.4" stroke-linecap="round" fill="none"/></g></g>
  ${carry ? '<g class="owl-carry"><rect x="-22" y="44" width="44" height="12" rx="6" fill="#e9d3a4" stroke="#7a4b25" stroke-width="2"/><rect x="-16" y="54" width="36" height="11" rx="5.5" fill="#dcc08a" stroke="#7a4b25" stroke-width="2"/><path d="M-2 44 v21" stroke="#8e1f2c" stroke-width="3"/></g>' : ''}
  <g class="owl-body">
    <ellipse cx="0" cy="16" rx="25" ry="31" fill="url(#${id}-body)" stroke="#d8b06a" stroke-width="1.2"/>
    <path d="M-12 8 q3 3 6 0 M2 14 q3 3 6 0 M-8 24 q3 3 6 0 M6 30 q3 3 6 0 M-14 34 q3 3 6 0" stroke="#5c5346" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M-10 46 l-3 6 M-6 46 l0 7 M6 46 l0 7 M10 46 l3 6" stroke="#6b5a3a" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="0" cy="-20" r="21" fill="url(#${id}-body)" stroke="#d8b06a" stroke-width="1.2"/>
    <circle cx="-8.5" cy="-21" r="8.5" fill="#fffef9"/><circle cx="8.5" cy="-21" r="8.5" fill="#fffef9"/>
    <circle cx="-8.5" cy="-21" r="5.6" fill="#f4c13d"/><circle cx="8.5" cy="-21" r="5.6" fill="#f4c13d"/>
    <circle cx="-8.5" cy="-21" r="3" fill="#120d08"/><circle cx="8.5" cy="-21" r="3" fill="#120d08"/>
    <circle cx="-7.3" cy="-22.4" r="1.1" fill="#fff"/><circle cx="9.7" cy="-22.4" r="1.1" fill="#fff"/>
    <path d="M-3 -14 L0 -7 L3 -14 Z" fill="#3b332a"/>
  </g>
</svg>`;
      const flyer = document.createElement('div');
      flyer.className = 'owl-flyer';
      flyer.append(holder.firstElementChild);
      return flyer;
    },
  };
})();

// 두루마리 위아래 막대. 아래 막대가 내려가며 종이가 펼쳐진다.
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
  enter(slide) {
    const paper = slide.querySelector('.welcome-scroll');
    if (!paper) return;
    slide.querySelector('.welcome-seal')?.remove();
    const wrap = HRA_SCROLL.wrap(paper, 'scroll-wrap');
    const seal = document.createElement('div');
    seal.className = 'seal-split';
    seal.innerHTML = '<i class="seal-half seal-left"></i><i class="seal-half seal-right"></i>';
    wrap.append(seal);
    slide.append(HRA_OWL.create());
  },
};
