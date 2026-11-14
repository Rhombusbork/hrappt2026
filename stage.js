// 슬라이드 목록과 화면 자료는 slides.js에 있다. 이 파일은 그리기와 진행만 맡는다.
const houses = HRA_DATA.houses;
const flow = slides.filter(item => !item.spare);
const byId = new Map(slides.map(item => [item.id, item]));
const get = id => document.getElementById(id);
const storeKey = 'hra-live-slides-v2';
const initialState = {
  scores: [0, 0, 0, 0],
  guests: [
    { name: '윤지후', role: '지도 교수 · 시연', occupation: '', hobby: '' },
    { name: '박서연', role: '선배 · 시연', occupation: '', hobby: '' },
  ],
};
let state = readState();
let current = flow[0];
let countdown;
let memory = 1;
const mediaFiles = new Map();
const photoAnswerNames = new Map();
const slide = get('slide');
let presenterWindow;
let staged = false;
let revealed = false;
let captionJob;
let effectCleanup;
let lastRendered = null;
let cameFrom = null;
const origin = location.protocol === 'file:' ? '*' : location.origin;
const candidates = ['이도윤', '김하늘', '최서현', '윤지후'];
const correctCandidate = 1;
let chosenCandidate = null;
let answerLocked = false;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    return saved ?? structuredClone(initialState);
  } catch {
    return structuredClone(initialState);
  }
}

function save() {
  try {
    localStorage.setItem(storeKey, JSON.stringify(state));
  } catch {
    // This tab can continue the demo when browser storage is unavailable.
  }
}

function node(tag, content, className) {
  const el = document.createElement(tag);
  if (content) el.textContent = content;
  if (className) el.className = className;
  return el;
}

function image(src, className, alt = '') {
  const el = node('img', '', className);
  el.src = src;
  el.alt = alt;
  return el;
}

function button(label, action) {
  const el = node('button', label);
  el.type = 'button';
  el.addEventListener('click', action);
  return el;
}

function tiles(parent, entries, className = '') {
  const list = node('div', '', 'tiles ' + className);
  for (const [title, detail, accent] of entries) {
    const item = node('div', '', 'tile');
    item.append(node('strong', title));
    if (detail) item.append(node('span', detail));
    if (accent) item.style.setProperty('--house', accent);
    list.append(item);
  }
  parent.append(list);
}

function flowIndex(item = current) {
  return flow.indexOf(item);
}

function pageNumber(item = current) {
  const position = flowIndex(item);
  return position < 0 ? '예비' : String(position + 1).padStart(2, '0');
}

function sceneUrl(scene) {
  if (!scene) return 'none';
  return [scene].flat().map(name => 'url("./' + (name.includes('/') ? name : 'scenes/' + name + '.webp') + '")').join(',');
}

function timer(parent, duration) {
  const wrapper = node('div', '', 'timer');
  const output = node('output');
  const progress = node('progress');
  progress.max = duration;
  progress.setAttribute('aria-label', '남은 시간');
  let remaining = duration;
  const draw = () => {
    output.textContent = String(Math.floor(remaining / 60)).padStart(2, '0') + ':' + String(remaining % 60).padStart(2, '0');
    output.style.color = remaining < 60 && duration >= 60 ? '#ff9696' : '';
    progress.value = remaining;
  };
  const start = button('시작', () => {
    if (countdown || remaining === 0) return;
    const end = Date.now() + remaining * 1000;
    countdown = setInterval(() => {
      remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      draw();
      if (!remaining) stopTimer();
    }, 150);
  });
  start.dataset.cue = 'true';
  start.addEventListener('click', () => { start.dataset.used = 'true'; });
  const reset = button('초기화', () => {
    stopTimer();
    remaining = duration;
    draw();
  });
  wrapper.append(output, start, reset);
  if (duration === 15) wrapper.append(progress);
  parent.append(wrapper);
  draw();
}

function stopTimer() {
  clearInterval(countdown);
  countdown = undefined;
}

function photo(parent, kind) {
  const key = kind + ':' + memory;
  const sample = kind === 'child' ? './portraits/child.webp' : './portraits/adult.webp';
  const asset = image(mediaFiles.get(key) ?? sample, 'photo-demo', '카드 ' + memory + '번 사진');
  if (kind === 'adult') {
    const portraits = node('div', '', 'portrait-transition');
    portraits.append(image(mediaFiles.get('child:' + memory) ?? './portraits/child.webp', 'photo-demo photo-before'), asset);
    parent.append(portraits);
  } else {
    parent.append(asset);
  }
  if (!mediaFiles.has(key)) parent.append(node('p', '시연용 인물 사진', 'note'));
}

function candidatePortrait(position) {
  return image('./portraits/candidate-' + (position + 1) + '.webp', 'candidate-portrait');
}

function renderQuestion(body) {
  const options = node('div', '', 'candidate-grid');
  const status = node('p', '', 'answer-status');
  status.setAttribute('role', 'status');
  const lock = button('답안 확정', () => {
    if (chosenCandidate === null || answerLocked) return;
    answerLocked = true;
    draw();
  });
  lock.dataset.cue = 'true';
  const draw = () => {
    [...options.children].forEach((choice, i) => {
      choice.setAttribute('aria-pressed', String(i === chosenCandidate));
      choice.disabled = answerLocked;
    });
    lock.disabled = chosenCandidate === null || answerLocked;
    status.textContent = answerLocked ? '답안 확정 · ' + (chosenCandidate + 1) + '번' : '시연 문제';
    notifyPresenter();
  };
  candidates.forEach((name, i) => {
    const option = button('', () => {
      chosenCandidate = i;
      draw();
    });
    const label = node('span', '', 'candidate-name');
    label.append(node('b', String(i + 1)), node('span', name));
    option.append(candidatePortrait(i), label);
    options.append(option);
  });
  const controls = node('div', '', 'question-controls');
  controls.append(status, lock);
  body.append(options, controls);
  draw();
}

function renderAnswer(body) {
  const result = node('div', '', 'answer-feature');
  const text = node('div', '', 'answer-copy');
  text.append(node('span', '정답 · 2번', 'answer-tag'), node('strong', candidates[correctCandidate]), node('span', '최다 발표자 · 시연 정답'));
  if (answerLocked) {
    text.append(node('span', chosenCandidate === correctCandidate ? '확정 답안과 일치합니다' : '확정 답안 · ' + (chosenCandidate + 1) + '번', 'answer-outcome'));
  }
  text.append(node('span', '정답 기숙사 +30점', 'answer-points'));
  result.append(candidatePortrait(correctCandidate), text);
  body.append(result);
}

// 초대장(hra26yep.vercel.app)의 학생증과 같은 항목과 배치.
function studentCard(guest, i) {
  const saved = mediaFiles.get('guest:' + guest.name);
  if (saved) {
    const card = image(saved, 'student-card-image', guest.name + ' 학생증');
    card.dataset.step = String(i);
    return card;
  }
  const house = houses.find(item => item.name === guest.house);
  const card = node('article', '', 'student-card');
  card.dataset.step = String(i);
  card.style.setProperty('--ink', house?.color ?? '#6f283b');
  const head = node('header', '', 'student-card-head');
  const title = node('div');
  title.append(node('b', 'HRA 2026'), node('small', '학생증'));
  head.append(image(house?.crest ?? './art/crest_master.png', 'student-card-crest'), title);
  const portrait = node('div', '', 'student-card-portrait');
  portrait.innerHTML = '<svg viewBox="0 0 64 82" aria-hidden="true"><circle cx="32" cy="28" r="12"/><path d="M10 67c0-15 9-24 22-24s22 9 22 24Z"/><path class="portrait-star" d="M48 14l2-5 2 5 5 2-5 2-2 5-2-5-5-2Z"/></svg>';
  const fields = node('dl', '', 'student-card-fields');
  const field = (label, value, className) => {
    const row = node('div');
    row.append(node('dt', label), node('dd', value || '—', className));
    return row;
  };
  fields.append(field('이름', guest.name, 'student-card-name'), field('소속', guest.role));
  if (guest.occupation) fields.append(field('하는 일', guest.occupation));
  if (guest.hobby) fields.append(field('취미', guest.hobby));
  const main = node('div', '', 'student-card-body');
  main.append(portrait, fields);
  const foot = node('footer', '', 'student-card-foot');
  const sign = node('div', '', 'student-card-sign');
  sign.append(node('small', '서명'));
  foot.append(sign, node('strong', house?.name ?? '기숙사', 'student-card-house'));
  card.append(head, main, foot);
  return card;
}

const sceneBodies = {
  welcome: body => {
    const scroll = node('div', '', 'welcome-scroll');
    scroll.append(node('strong', '신입생 여러분 입학을 축하합니다', 'welcome-ko'), node('span', 'Welcome to HRA-Warts', 'welcome-en'));
    body.append(scroll);
  },
  guests: body => {
    const visible = state.guests.filter(guest => !guest.hidden);
    if (!visible.length) return body.append(node('p', '표시할 내빈이 없습니다. 운영 패널에서 추가해 주세요.', 'note'));
    const deck = node('div', '', 'student-deck');
    visible.forEach((guest, i) => deck.append(studentCard(guest, i)));
    body.append(deck);
  },
  houses: body => {
    const banners = node('div', '', 'banners');
    houses.forEach((house, i) => {
      const banner = node('div', '', 'banner');
      banner.dataset.step = String(i);
      banner.style.setProperty('--house', house.color);
      banner.append(image(house.crest, 'banner-crest', house.name + ' 문장'), node('strong', house.name, 'banner-name'));
      banners.append(banner);
    });
    body.append(banners);
  },
  students: body => tiles(body, [['김하늘', '20기 · 그리핀도르'], ['이도윤', '20기 · 슬리데린'], ['최서현', '20기 · 래번클로']], 'students'),
  quiz: renderQuestion,
  answer: renderAnswer,
  capsule: body => {
    const stage = node('div', '', 'capsule-stage');
    const reveal = node('div', '', 'capsule-reveal reveal-target');
    photo(reveal, 'child');
    timer(reveal, 15);
    stage.append(node('div', '', 'capsule-box'), reveal);
    body.append(stage);
  },
  photo: body => {
    photo(body, 'adult');
    const hasEventPhoto = mediaFiles.has('child:' + memory) || mediaFiles.has('adult:' + memory);
    const name = photoAnswerNames.get(String(memory)) || (hasEventPhoto ? '현재 모습' : '윤지후 교수님 · 시연');
    body.append(node('p', name, 'photo-answer-name'));
  },
  video: body => {
    const wrapper = node('div', '', 'media');
    const saved = mediaFiles.get('video');
    if (saved) {
      const video = node('video');
      Object.assign(video, { src: saved, controls: true, playsInline: true });
      wrapper.append(video);
    } else {
      wrapper.append(node('div', '영상 자리', 'video-placeholder'));
    }
    body.append(wrapper);
  },
  bingo: body => tiles(body, HRA_DATA.bingo.map(item => [item]), 'bingo'),
  timer: body => timer(body, current.duration ?? 600),
  bowling: body => tiles(body, [['100점', '가장 먼 구간'], ['50점', '중간 구간'], ['10점', '가까운 구간']]),
  scores: body => {
    const max = Math.max(...state.scores);
    const board = node('div', '', 'score-board');
    houses.forEach((house, i) => {
      const row = node('div', '', 'score-row');
      const track = node('div', '', 'score-track');
      const bar = node('i');
      const score = state.scores[i];
      bar.style.width = (max ? score / max * 100 : 0) + '%';
      bar.style.background = house.color;
      track.append(bar);
      const name = node('span', '', 'score-house');
      name.append(image(house.crest, 'score-crest'), node('strong', house.name));
      row.append(name, track, node('b', String(score), 'score-total'));
      board.append(row);
    });
    body.append(board);
  },
  winner: body => {
    const max = Math.max(...state.scores);
    if (!max) return body.append(node('p', '점수 입력 대기 중', 'winner-waiting'));
    const winners = houses.filter((_, i) => state.scores[i] === max);
    const podium = node('div', '', 'winner-podium');
    if (winners.length > 1) podium.append(node('span', '공동 1위', 'winner-tie'));
    const list = node('div', '', 'winner-list');
    for (const house of winners) {
      const card = node('div', '', 'winner-house');
      card.style.setProperty('--house', house.color);
      card.append(image(house.crest, 'winner-crest', house.name + ' 문장'), node('strong', house.name));
      list.append(card);
    }
    podium.append(list, node('b', max + '점', 'winner-score'));
    body.append(podium);
  },
  awards: body => {
    const list = node('div', '', 'award-scrolls');
    list.style.setProperty('--count', HRA_DATA.awards.length);
    HRA_DATA.awards.forEach((award, i) => {
      const scroll = node('div', '', 'award-scroll');
      scroll.dataset.step = String(i);
      scroll.append(node('span', award.category, 'award-category'), node('strong', award.name, 'award-name'));
      list.append(scroll);
    });
    body.append(list);
  },
  rows: body => tiles(body, [['1열', '교수님 · 내빈'], ['2열', '1~19기 선배님'], ['3열', 'HRA 20기']]),
};

function stepItems() {
  return [...slide.querySelectorAll('[data-step]')];
}

function showStep() {
  const next = stepItems().find(item => !item.classList.contains('is-shown'));
  if (!next) return false;
  slide.querySelector('.is-current')?.classList.remove('is-current');
  next.classList.add('is-shown', 'is-current');
  notifyPresenter();
  return true;
}

const effectApi = {
  next: () => go(neighbour(1)),
  wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
  reveal: () => reveal(),
  get reduced() { return reducedMotion(); },
  get step() { return slide.querySelectorAll('[data-step].is-shown').length; },
  get id() { return current.id; },
  get from() { return cameFrom; },
};

function effect() {
  return window.HRA_EFFECTS?.[current.effect];
}

function render() {
  stopTimer();
  try {
    effectCleanup?.();
  } catch (error) {
    console.error(error);
  }
  effectCleanup = undefined;
  const item = current;
  cameFrom = lastRendered;
  lastRendered = item.id;
  const page = pageNumber(item);
  slide.className = 'slide ' + item.theme;
  slide.dataset.id = item.id;
  slide.dataset.content = item.body ?? '';
  slide.style.setProperty('--scene-image', sceneUrl(item.scene));
  slide.replaceChildren();
  if (item.theme !== 'blackout') {
    if (item.theme !== 'bare') {
      const frame = node('div', '', 'scene-frame');
      frame.setAttribute('aria-hidden', 'true');
      for (let corner = 0; corner < 4; corner++) frame.append(node('span', '❦'));
      slide.append(frame, node('span', 'HRA', 'mark'));
    }
    if (item.eyebrow) slide.append(node('p', item.eyebrow, 'eyebrow'));
    if (item.title) slide.append(node('h1', item.title));
    if (item.description) slide.append(node('p', item.description, 'description'));
    if (sceneBodies[item.body]) {
      const body = node('div', '', 'scene-body');
      sceneBodies[item.body](body);
      slide.append(body);
    }
    if (item.theme !== 'bare') slide.append(node('span', item.corner ?? 'HRA 2026  /  ' + (item.spare ? '예비' : 'P' + page), 'corner'));
  }
  if (item.reveal) {
    const parts = { title: 'h1', description: '.description', body: '.scene-body' };
    for (const part of item.revealHide ?? ['description', 'body']) slide.querySelector(parts[part])?.classList.add('reveal-target');
  }
  const steps = stepItems();
  steps.slice(0, item.stepsStart ?? 0).forEach(step => step.classList.add('is-shown'));
  steps[(item.stepsStart ?? 0) - 1]?.classList.add('is-current');
  updateReveal();
  get('number').textContent = page;
  get('total').textContent = ' / ' + flow.length;
  get('progress').style.width = ((Math.max(flowIndex(), 0) + 1) * 100 / flow.length) + '%';
  get('prev').disabled = item === flow[0];
  get('next').disabled = item === flow.at(-1);
  try {
    const cleanup = effect()?.enter?.(slide, effectApi);
    if (typeof cleanup === 'function') effectCleanup = cleanup;
  } catch (error) {
    console.error(error);
  }
  notifyPresenter();
}

function waiting() {
  return Boolean(current.reveal && !revealed && (staged || current.revealAlways));
}

function updateReveal() {
  const isWaiting = waiting();
  slide.classList.toggle('awaiting-cue', isWaiting);
}

function reveal() {
  if (!slide.classList.contains('awaiting-cue')) return false;
  revealed = true;
  slide.classList.remove('awaiting-cue');
  slide.classList.add('cue-revealed');
  slide.querySelector('.reveal-standalone')?.remove();
  slide.querySelector('.suspense-line')?.remove();
  notifyPresenter();
  return true;
}

function runCue() {
  try {
    if (effect()?.cue?.(slide, effectApi) === true) return;
  } catch (error) {
    console.error(error);
  }
  if (reveal() || showStep()) return;
  if (current.id === 'video') {
    const video = slide.querySelector('video');
    if (video) {
      video.dataset.used = 'true';
      video.play().catch(() => video.focus());
    }
    return;
  }
  const control = slide.querySelector('[data-cue]:not([data-used])');
  if (control && !control.disabled) {
    control.click();
    control.dataset.used = 'true';
  } else if (current.cueNext) go(neighbour(1));
}

// PPT처럼: 다음 버튼은 이 장에 남은 애니메이션이 있으면 그것을 먼저 실행하고, 없을 때만 다음 장으로 간다.
function hasPending() {
  try {
    if (effect()?.pending?.(slide, effectApi)) return true;
  } catch (error) {
    console.error(error);
  }
  if (waiting()) return true;
  if (current.steps && stepItems().some(item => !item.classList.contains('is-shown'))) return true;
  if (current.id === 'video') {
    const video = slide.querySelector('video');
    if (video && !video.dataset.used) return true;
  }
  const control = slide.querySelector('[data-cue]:not([data-used])');
  return Boolean(control && !control.disabled);
}

function actionLabel() {
  if (waiting()) return current.reveal;
  if (current.steps && stepItems().some(item => !item.classList.contains('is-shown'))) return current.stepLabel;
  if (current.id === 'quiz1-q') return chosenCandidate !== null && !answerLocked ? '답안 확정' : '';
  return current.cue ?? '';
}

function setCaption(value) {
  clearTimeout(captionJob);
  const caption = get('caption');
  const text = typeof value === 'string' ? value.trim().slice(0, 100) : '';
  caption.hidden = !text;
  caption.textContent = '';
  if (!text || reducedMotion()) {
    caption.textContent = text;
    return;
  }
  const letters = [...text];
  let length = 1;
  function write() {
    caption.textContent = letters.slice(0, length).join('');
    if (length++ < letters.length) captionJob = setTimeout(write, 27);
  }
  write();
}

function neighbour(direction) {
  const position = flowIndex();
  if (position >= 0) return flow[position + direction];
  const anchor = flow.indexOf(byId.get(current.after));
  return flow[direction > 0 ? anchor + 1 : anchor];
}

function notifyPresenter() {
  if (!presenterWindow || presenterWindow.closed) return;
  presenterWindow.postMessage({
    hra: 'stage', id: current.id, page: pageNumber(), total: flow.length, title: current.title || current.chapter,
    next: neighbour(1)?.chapter, first: current === flow[0], scores: state.scores, actionLabel: actionLabel(),
  }, origin);
}

get('presenter').addEventListener('click', () => {
  if (presenterWindow && !presenterWindow.closed) {
    presenterWindow.focus();
    return;
  }
  presenterWindow = window.open('./presenter.html', 'hra-presenter', 'popup,width=680,height=760');
  if (!presenterWindow) get('presenter').textContent = '팝업 허용 필요';
});

addEventListener('message', event => {
  if (event.source !== presenterWindow || (origin !== '*' && event.origin !== origin)) return;
  const data = event.data;
  if (data?.hra !== 'presenter') return;
  switch (data.action) {
    case 'ready':
      staged = true;
      render();
      break;
    case 'next':
      goStep(1);
      break;
    case 'prev':
      goStep(-1);
      break;
    case 'cue':
      runCue();
      break;
    case 'caption':
      setCaption(data.text);
      break;
    case 'clear':
      setCaption('');
      break;
    case 'scores':
      if (Array.isArray(data.text) && data.text.length === houses.length &&
          data.text.every(score => Number.isInteger(score) && score >= 0 && score <= 99999)) {
        updateScores(data.text);
      }
      break;
  }
});

function updateScores(scores) {
  state.scores = scores;
  save();
  if (['scores', 'winner'].includes(current.id)) render();
  else notifyPresenter();
}

function hashFor(item) {
  return item.spare ? item.id : 'p' + (flowIndex(item) + 1);
}

function go(item) {
  if (!item || item === current) return;
  location.hash = hashFor(item);
}

function goStep(direction) {
  if (direction > 0 && hasPending()) {
    runCue();
    return;
  }
  go(neighbour(direction));
}

function openOperator() {
  const scores = get('score-inputs');
  scores.replaceChildren();
  houses.forEach((house, i) => {
    const label = node('label', house.name);
    const input = node('input');
    Object.assign(input, { type: 'number', name: 'score' + i, min: 0, max: 99999, required: true, value: state.scores[i] });
    label.append(input);
    scores.append(label);
  });
  renderGuestList();
  get('media-card').value = String(memory);
  updateMediaStatus();
  get('operator').showModal();
}

function updateMediaStatus() {
  const card = get('media-card').value;
  const child = mediaFiles.has('child:' + card) ? '등록됨' : '시연 사진';
  const adult = mediaFiles.has('adult:' + card) ? '등록됨' : '시연 사진';
  const video = mediaFiles.has('video') ? '등록됨' : '미등록';
  get('photo-answer-name').value = photoAnswerNames.get(card) ?? '';
  get('media-status').textContent = '카드 ' + card + '번 · 어린 시절 ' + child + ' · 현재 ' + adult + ' · 영상 ' + video;
}

function keepFile(key, file) {
  const previous = mediaFiles.get(key);
  if (previous) URL.revokeObjectURL(previous);
  mediaFiles.set(key, URL.createObjectURL(file));
}

get('media-card').addEventListener('change', event => {
  memory = Number(event.target.value);
  updateMediaStatus();
  if (['quiz2-q', 'quiz2-a'].includes(current.id)) render();
});
get('photo-answer-name').addEventListener('change', event => {
  photoAnswerNames.set(get('media-card').value, event.target.value.trim());
  if (current.id === 'quiz2-a') render();
});
for (const [id, kind] of [['child-file', 'child'], ['adult-file', 'adult'], ['activity-file', 'video']]) {
  const picker = get(id);
  picker.addEventListener('change', () => {
    const file = picker.files[0];
    if (!file) return;
    keepFile(kind === 'video' ? 'video' : kind + ':' + get('media-card').value, file);
    picker.value = '';
    updateMediaStatus();
    if (['quiz2-q', 'quiz2-a', 'video'].includes(current.id)) render();
  });
}

function renderGuestList() {
  const list = get('guest-list');
  list.replaceChildren();
  state.guests.forEach((guest, i) => {
    const row = node('div');
    const inputs = [['name', '이름', 24], ['role', '소속', 30], ['occupation', '하는 일', 30], ['hobby', '취미', 30]].map(([key, label, max]) => {
      const input = node('input');
      Object.assign(input, { value: guest[key] ?? '', maxLength: max, placeholder: label });
      input.setAttribute('aria-label', '내빈 ' + (i + 1) + ' ' + label);
      input.dataset.key = key;
      return input;
    });
    const card = node('input');
    Object.assign(card, { type: 'file', accept: 'image/*' });
    card.setAttribute('aria-label', '내빈 ' + (i + 1) + ' 학생증 이미지');
    card.addEventListener('change', () => {
      if (!card.files[0]) return;
      keepFile('guest:' + guest.name, card.files[0]);
      updateGuests();
    });
    row.append(...inputs, button('수정', () => {
      const values = Object.fromEntries(inputs.map(input => [input.dataset.key, input.value.trim()]));
      if (!values.name || !values.role) return;
      Object.assign(guest, values);
      updateGuests();
    }), button(guest.hidden ? '표시' : '숨김', () => {
      guest.hidden = !guest.hidden;
      updateGuests();
    }), card);
    list.append(row);
  });
}

function updateGuests() {
  save();
  renderGuestList();
  if (current.id === 'guests') render();
}

get('score-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  updateScores(houses.map((_, i) => Number(data.get('score' + i))));
  get('operator').close();
});
get('guest-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const guest = Object.fromEntries(['guest', 'role', 'occupation', 'hobby'].map(key => [key, String(data.get(key) ?? '').trim()]));
  if (!guest.guest || !guest.role) return;
  const file = data.get('card');
  if (file?.size) keepFile('guest:' + guest.guest, file);
  state.guests.push({ name: guest.guest, role: guest.role, occupation: guest.occupation, hobby: guest.hobby });
  form.reset();
  updateGuests();
});
get('staff').addEventListener('click', openOperator);
get('contents').addEventListener('click', () => get('agenda').showModal());
get('prev').addEventListener('click', () => goStep(-1));
get('next').addEventListener('click', () => goStep(1));
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await get('stage').requestFullscreen();
  } catch {
    get('fullscreen').textContent = '전체화면 사용 불가';
  }
}
document.addEventListener('fullscreenchange', () => {
  const parent = document.fullscreenElement === get('stage') ? get('stage') : document.body;
  parent.append(get('agenda'), get('operator'));
});
get('fullscreen').addEventListener('click', fullscreen);
document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => el.closest('dialog').close()));
for (const item of [...flow, ...slides.filter(entry => entry.spare)]) {
  const entry = node('li');
  entry.append(button(item.spare ? item.chapter + ' (예비)' : item.chapter, () => {
    get('agenda').close();
    go(item);
  }));
  get('agenda-list').append(entry);
}
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.target.matches('input,video,textarea,select')) return;
  if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    if (event.key === 'Home') go(flow[0]);
    else if (event.key === 'End') go(flow.at(-1));
    else goStep(['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1);
  } else if (event.key.toLowerCase() === 'f') fullscreen();
  else if (event.key.toLowerCase() === 'o') openOperator();
  else if (event.key === ' ' && event.target === document.body) {
    event.preventDefault();
    runCue();
  }
});
function restorePosition() {
  const hash = location.hash.slice(1);
  const position = Number(hash.match(/^p(\d+)$/)?.[1]);
  current = flow[position - 1] ?? byId.get(hash) ?? flow[0];
  if (current.id === 'quiz1-q') {
    chosenCandidate = null;
    answerLocked = false;
  }
  staged = Boolean(presenterWindow && !presenterWindow.closed);
  revealed = false;
  setCaption('');
  render();
  const upcoming = neighbour(1);
  if (upcoming?.scene) {
    for (const url of sceneUrl(upcoming.scene).matchAll(/url\("([^"]+)"\)/g)) new Image().src = url[1];
  }
}
addEventListener('hashchange', restorePosition);
addEventListener('storage', event => {
  if (event.key !== storeKey) return;
  state = readState();
  if (['guests', 'scores', 'winner'].includes(current.id)) render();
});
restorePosition();

// 확인용: index.html?cues=3#p4 는 4번 슬라이드에서 장면 진행을 3번 누른다. ?scores=120,80,60,40 은 저장하지 않고 점수만 바꾼다.
const checks = new URLSearchParams(location.search);
if (checks.has('scores')) {
  state.scores = checks.get('scores').split(',').map(Number);
  render();
}
for (let i = 0; i < Number(checks.get('cues') ?? 0); i++) setTimeout(runCue, 400 * (i + 1));
