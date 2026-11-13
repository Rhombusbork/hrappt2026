// 연출 A5: 부엉이가 두루마리 묶음을 물고 와 내려놓고, 장면 진행마다 양피지가 하나씩 펼쳐진다.
// 부엉이와 막대는 owl-letter.js의 HRA_OWL, HRA_SCROLL을 쓴다.
(window.HRA_EFFECTS ||= {}).awards = {
  enter(slide) {
    slide.querySelectorAll('.award-scroll').forEach((paper, i) => {
      HRA_SCROLL.wrap(paper, 'award-slot').style.setProperty('--i', i);
    });
    const bundle = document.createElement('div');
    bundle.className = 'award-bundle';
    slide.append(HRA_OWL.create({ carry: true }), bundle);
  },
};
