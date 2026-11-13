// 연출 B6: 나무상자(타임캡슐)가 떠오르고, "상자 열기"에 뚜껑이 열리며 어린 시절 사진이 튀어나온다.
// 사진 공개(.cue-revealed)는 stage.js가 한다. 이 파일은 상자만 만든다.
(window.HRA_EFFECTS ||= {}).capsule = {
  enter(slide) {
    const box = slide.querySelector('.capsule-box');
    if (!box) return;
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<i class="capsule-glow"></i><div class="capsule-lid"><i class="capsule-lock"></i></div><div class="capsule-body"><i class="capsule-band"></i><i class="capsule-plate">HRA</i></div>';
  },
};
