const slides = [
  ['입장 대기', '해피 크리스마스, 흐라', '검은 호수를 건너, 오늘 밤의 연회로.', 'hero'],
  ['오프닝', '입학통지서', 'HRA 마법학교의 겨울 연회에 여러분을 초대합니다.', 'paper', '✦'],
  ['개회', '대연회장의 문이 열립니다', '기숙사 대항전 · 크리스마스 만찬 · 명예의 전당', 'wine', '✧'],
  ['내빈 소개', '오늘의 귀빈', '교수님과 멘토진, 후원진, 선배님들을 소개합니다.', '', 'guests'],
  ['내빈 명단 관리', '내빈 소개 준비', '운영 패널에서 시연 명단을 추가하거나 표시 여부를 바꿀 수 있습니다.', 'paper', 'staff'],
  ['기숙사 대항전', '네 기숙사, 하나의 연회', '오늘 밤 함께 기숙사 컵에 도전합니다.', 'wine', 'houses'],
  ['20기 소개', 'HRA 20기 학생증', '마법학교 신입생들을 소개합니다.', 'paper', 'students'],
  ['1부 · 기억의 필름', '20기의 기억을 되감다', '전반기 수업과 활동을 함께 돌아봅니다.', 'hero', 'film'],
  ['20기를 맞춰라 · 문제 01', '전반기에 가장 많이 발표한 사람은?', '기숙사별로 상의한 뒤 후보를 선택하세요.', '', 'quiz'],
  ['20기를 맞춰라 · 정답 01', '정답 공개', '', 'paper', 'answer'],
  ['1부 · 퀴즈 2', '봉인된 기억을 고르세요', '네 장의 카드 중 한 장을 선택하세요.', 'wine', 'cards'],
  ['교수님을 맞혀라 · 문제 02', '이 어린이는 누구일까요?', '', '', 'photo'],
  ['교수님을 맞혀라 · 정답 02', '정답 공개', '', 'paper', 'photo'],
  ['만찬', '크리스마스 만찬', '함께 식사하며 오늘의 이야기를 나눠 주세요.', 'wine', '✦'],
  ['20기 활동 영상', '기억의 극장', 'HRA 20기의 전반기 활동을 돌아봅니다.', '', 'video'],
  ['2부 · 교류 빙고', '아홉 칸의 인맥 지도', '종이 빙고판을 들고 조건에 맞는 사람을 찾아보세요.', 'paper', 'bingo'],
  ['2부 · 빙고 진행', '제한 시간 10분', '', '', 'timer'],
  ['2부 · 물병 볼링', '물약병 볼링', '물병이 멈춘 구간에 따라 점수를 얻습니다.', 'paper', 'bowling'],
  ['2부 · 최종 순위', '기숙사 컵 점수판', '퀴즈와 물병 볼링 합산 결과', '', 'scores'],
  ['휴식', '잠시, 별빛 아래에서', '10분 뒤 명예의 전당에서 만나요.', 'hero', 'timer'],
  ['3부 · 시상식', '명예의 전당', '오늘의 수상자들에게 축하를 전합니다.', 'wine', '✦'],
  ['부문별 시상', '수상자를 소개합니다', '수상자 이름과 활동 사진을 공개합니다.', 'paper', 'awards'],
  ['귀빈 말씀', '감사와 격려의 말씀', '교수님 격려 말씀 · 위원장 마무리 인사', '', '✧'],
  ['단체사진 안내', '무대 앞으로 모여 주세요', '촬영 전 아래 순서대로 자리해 주세요.', 'paper', 'rows'],
  ['기념 촬영', 'HRA 송년회', 'Happy Christmas, HR', 'hero photo-wall'],
  ['폐회', '다음 목적지를 향해서', '오늘 밤의 여정에 함께해 주셔서 감사합니다.', 'hero'],
];

const houses = [
  { name: '그리핀도르', color: '#bc626b' },
  { name: '슬리데린', color: '#62a88f' },
  { name: '래번클로', color: '#739dd5' },
  { name: '후플푸프', color: '#e0b85b' },
];
const get = id => document.getElementById(id);
const storeKey = 'hra-live-slides-v1';
const initialState = {
  scores: [0, 0, 0, 0],
  guests: [{ name: '윤지후', role: '지도 교수 · 시연' }, { name: '박서연', role: '선배 · 시연' }],
};
let state = readState();
let index = 0;
let countdown;
let memory = 1;
const mediaFiles = new Map();
const photoAnswerNames = new Map();
const slide = get('slide');
let presenterWindow;
let staged = false;
let revealed = false;
let captionJob;
const revealLabels = new Map([[1, '봉인 열기'], [9, '정답 공개'], [12, '현재 사진 공개'], [18, '순위 공개'], [21, '시상 공개']]);
const cueLabels = new Map([[3, '다음 학생증'], [11, '15초 시작'], [14, '영상 재생'], [16, '빙고 시작'], [19, '휴식 시작']]);
const origin = location.protocol === 'file:' ? '*' : location.origin;
const candidates = ['이도윤', '김하늘', '최서현', '윤지후'];
const correctCandidate = 1;
const answerPages = new Set([9, 12]);
let chosenCandidate = null;
let answerLocked = false;

function readState() {
  try {
    return JSON.parse(localStorage.getItem(storeKey)) ?? structuredClone(initialState);
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

function choices(parent, labels, action) {
  const list = node('div', '', 'tiles');
  labels.forEach((label, i) => {
    const choice = button(label, () => {
      for (const other of list.children) other.setAttribute('aria-pressed', String(other === choice));
      action?.(i);
    });
    choice.setAttribute('aria-pressed', 'false');
    list.append(choice);
  });
  parent.append(list);
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

function media(parent, video, label) {
  const wrapper = node('div', '', 'media');
  const asset = node(video ? 'video' : 'img');
  const key = index + ':' + (video ? 'video' : memory);
  const sample = index === 11 ? './portraits/child.webp' : index === 12 ? './portraits/adult.webp' : undefined;
  const saved = mediaFiles.get(key) ?? sample;
  asset.hidden = !saved;
  if (saved) asset.src = saved;
  if (video) {
    asset.controls = true;
    asset.playsInline = true;
  } else {
    asset.alt = label;
    asset.className = 'photo-demo';
  }
  const younger = index === 12 ? mediaFiles.get('11:' + memory) ?? './portraits/child.webp' : undefined;
  if (younger) {
    const previous = node('img', '', 'photo-demo photo-before');
    previous.src = younger;
    previous.alt = '';
    const portraits = node('div', '', 'portrait-transition');
    portraits.append(previous, asset);
    wrapper.append(portraits);
  } else {
    wrapper.append(asset);
  }
  parent.append(wrapper);
  if (!video && !mediaFiles.has(key)) parent.append(node('p', '시연용 인물 사진', 'note'));
}

function candidatePortrait(position) {
  const portrait = node('img', '', 'candidate-portrait');
  portrait.src = './portraits/candidate-' + (position + 1) + '.webp';
  portrait.alt = '';
  return portrait;
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
  const photo = candidatePortrait(correctCandidate);
  const text = node('div', '', 'answer-copy');
  text.append(node('span', '정답 · 2번', 'answer-tag'), node('strong', candidates[correctCandidate]), node('span', '최다 발표자 · 시연 정답'));
  if (answerLocked) {
    text.append(node('span', chosenCandidate === correctCandidate ? '확정 답안과 일치합니다' : '확정 답안 · ' + (chosenCandidate + 1) + '번', 'answer-outcome'));
  }
  text.append(node('span', '정답 기숙사 +30점', 'answer-points'));
  result.append(photo, text);
  body.append(result);
}

const sceneBodies = {
  guests: body => {
    const visible = state.guests.filter(guest => !guest.hidden);
    if (!visible.length) return body.append(node('p', '표시할 내빈이 없습니다.'));
    let selected = 0;
    const card = node('div');
    const renderCard = () => {
      card.replaceChildren();
      tiles(card, [[visible[selected].name, visible[selected].role]]);
    };
    body.append(card);
    if (visible.length > 1) {
      const next = button('다음 학생증', () => {
        selected = (selected + 1) % visible.length;
        renderCard();
      });
      next.dataset.cue = 'true';
      body.append(next);
    }
    renderCard();
  },
  staff: body => body.append(button('운영 패널 열기', openOperator)),
  houses: body => tiles(body, houses.map((house, i) => [house.name, (i + 1) + '조', house.color]), 'score'),
  students: body => tiles(body, [['김하늘', '20기 · 그리핀도르'], ['이도윤', '20기 · 슬리데린'], ['최서현', '20기 · 래번클로']], 'students'),
  film: body => tiles(body, [['수업', '01'], ['토론', '02'], ['현장 활동', '03']]),
  quiz: renderQuestion,
  answer: renderAnswer,
  cards: body => {
    const selected = node('p', '카드 ' + memory + '번', 'note');
    choices(body, ['I', 'II', 'III', 'IV'], i => {
      memory = i + 1;
      selected.textContent = '카드 ' + memory + '번 선택';
    });
    body.append(selected);
  },
  photo: body => {
    media(body, false, '카드 ' + memory + '번 사진 선택');
    if (index === 11) timer(body, 15);
    else {
      const hasEventPhoto = mediaFiles.has('11:' + memory) || mediaFiles.has('12:' + memory);
      const name = photoAnswerNames.get(String(memory)) || (hasEventPhoto ? '현재 모습' : '윤지후 교수님 · 시연');
      body.append(node('p', name, 'photo-answer-name'));
    }
  },
  video: body => media(body, true, '20기 활동 영상 선택'),
  bingo: body => tiles(body, ['다른 기수', '같은 고향', '같은 취미', '책 추천', '첫 참석', '같은 생일 월', '다른 기숙사', '새로 만난 선배', '공통 관심사'].map(item => [item]), 'bingo'),
  timer: body => timer(body, 600),
  bowling: body => tiles(body, [['100점', '가장 먼 구간'], ['50점', '중간 구간'], ['10점', '가까운 구간']]),
  scores: body => {
    const max = Math.max(...state.scores);
    const winners = houses.filter((_, i) => state.scores[i] === max);
    const board = node('div', '', 'score-board');
    houses.forEach((house, i) => {
      const row = node('div', '', 'score-row');
      const track = node('div', '', 'score-track');
      const bar = node('i');
      const score = state.scores[i];
      bar.style.width = (max ? score / max * 100 : 0) + '%';
      bar.style.background = house.color;
      track.append(bar);
      row.append(node('strong', house.name), track, node('span', score + '점'));
      board.append(row);
    });
    body.append(board);
    const summary = max === 0 ? '점수 입력 대기 중' : (winners.length > 1 ? '공동 1위 · ' : '1위 · ') + winners.map(house => house.name).join(' · ');
    body.append(node('p', summary, 'note'));
  },
  awards: body => tiles(body, [['교수님 감사장', '감사와 존경을 담아'], ['전반기 개근상', '꾸준한 참여'], ['최다 발표상', '활발한 발표']]),
  rows: body => tiles(body, [['1열', '교수님 · 내빈'], ['2열', '1~19기 선배님'], ['3열', 'HRA 20기']]),
};

function render() {
  stopTimer();
  const [chapter, title, description, theme, content] = slides[index];
  const page = String(index + 1).padStart(2, '0');
  slide.className = 'slide ' + theme + (theme === 'hero' ? '' : ' center');
  slide.dataset.content = content ?? '';
  slide.dataset.page = page;
  slide.style.setProperty('--scene-image', 'url("./scenes/p' + page + '.webp")');
  const frame = node('div', '', 'scene-frame');
  frame.setAttribute('aria-hidden', 'true');
  for (let corner = 0; corner < 4; corner++) frame.append(node('span', '❦'));
  slide.replaceChildren(frame, node('span', 'HRA', 'mark'));
  if (content && !sceneBodies[content]) slide.append(node('div', content, 'ornament'));
  slide.append(node('p', index === 0 ? 'HRA 2026  /  YEAR-END PARTY' : chapter, 'eyebrow'), node('h1', title));
  if (description) slide.append(node('p', description, 'description'));
  if (sceneBodies[content]) {
    const body = node('div', '', 'scene-body');
    sceneBodies[content](body);
    slide.append(body);
  }
  slide.append(node('span', index === 0 ? '2026.12.26  ·  JEJU' : 'HRA 2026  /  P' + page, 'corner'));
  updateReveal();
  notifyPresenter();
  get('number').textContent = page;
  get('progress').style.width = ((index + 1) * 100 / slides.length) + '%';
  get('prev').disabled = index === 0;
  get('next').disabled = index === slides.length - 1;
}

function updateReveal() {
  const waiting = !revealed && revealLabels.has(index) && (staged || answerPages.has(index));
  slide.classList.toggle('awaiting-cue', waiting);
  for (const item of slide.querySelectorAll('.description,.scene-body')) item.hidden = waiting;
  if (waiting) {
    if (answerPages.has(index)) slide.append(node('p', '정답을 공개할 준비가 되면 큐를 실행하세요.', 'suspense-line'));
    const reveal = button(revealLabels.get(index), runCue);
    reveal.className = 'reveal-standalone';
    slide.append(reveal);
  }
}

function runCue() {
  if (slide.classList.contains('awaiting-cue')) {
    revealed = true;
    slide.classList.remove('awaiting-cue');
    slide.classList.add('cue-revealed');
    for (const item of slide.querySelectorAll('.description,.scene-body')) item.hidden = false;
    slide.querySelector('.reveal-standalone')?.remove();
    slide.querySelector('.suspense-line')?.remove();
    notifyPresenter();
  } else if (index === 14) {
    const video = slide.querySelector('video:not([hidden])');
    if (video) video.play().catch(() => video.focus());
  } else {
    slide.querySelector('[data-cue]')?.click();
  }
}

function setCaption(value) {
  clearTimeout(captionJob);
  const caption = get('caption');
  const text = typeof value === 'string' ? value.trim().slice(0, 100) : '';
  caption.hidden = !text;
  caption.textContent = '';
  if (!text || matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

function notifyPresenter() {
  if (!presenterWindow || presenterWindow.closed) return;
  const next = index === 3 ? slides[5] : slides[index + 1];
  const reveal = !revealed && revealLabels.get(index);
  presenterWindow.postMessage({
    hra: 'stage', index, title: slides[index][1], next: next?.[0], scores: state.scores,
    actionLabel: reveal || (index === 8 && chosenCandidate !== null && !answerLocked ? '답안 확정' : cueLabels.get(index)) || '',
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
      go(index === 3 ? 5 : index + 1);
      break;
    case 'prev':
      go(index === 5 ? 3 : index - 1);
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
        state.scores = data.text;
        save();
        if (index === 18) render();
        else notifyPresenter();
      }
      break;
  }
});

function go(position) {
  if (position < 0 || position >= slides.length || position === index) return;
  location.hash = 'p' + (position + 1);
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
  const child = mediaFiles.has('11:' + card) ? '등록됨' : '시연 사진';
  const adult = mediaFiles.has('12:' + card) ? '등록됨' : '시연 사진';
  const video = mediaFiles.has('14:video') ? '등록됨' : '미등록';
  get('photo-answer-name').value = photoAnswerNames.get(card) ?? '';
  get('media-status').textContent = '카드 ' + card + '번 · 어린 시절 ' + child + ' · 현재 ' + adult + ' · 영상 ' + video;
}

get('media-card').addEventListener('change', updateMediaStatus);
get('photo-answer-name').addEventListener('change', event => {
  photoAnswerNames.set(get('media-card').value, event.target.value.trim());
  if (index === 12) render();
});
for (const [id, prefix] of [['child-file', '11:'], ['adult-file', '12:'], ['activity-file', '14:']]) {
  const picker = get(id);
  picker.addEventListener('change', () => {
    const file = picker.files[0];
    if (!file) return;
    const key = prefix + (prefix === '14:' ? 'video' : get('media-card').value);
    const previous = mediaFiles.get(key);
    if (previous) URL.revokeObjectURL(previous);
    mediaFiles.set(key, URL.createObjectURL(file));
    picker.value = '';
    updateMediaStatus();
    if (index === 11 || index === 12 || index === 14) render();
  });
}

function renderGuestList() {
  const list = get('guest-list');
  list.replaceChildren();
  state.guests.forEach((guest, i) => {
    const row = node('div');
    const name = node('input');
    const role = node('input');
    Object.assign(name, { value: guest.name, maxLength: 24 });
    Object.assign(role, { value: guest.role, maxLength: 30 });
    name.setAttribute('aria-label', '내빈 ' + (i + 1) + ' 이름');
    role.setAttribute('aria-label', '내빈 ' + (i + 1) + ' 소개');
    row.append(name, role, button('수정', () => {
      if (!name.value.trim() || !role.value.trim()) return;
      Object.assign(guest, { name: name.value.trim(), role: role.value.trim() });
      updateGuests();
    }), button(guest.hidden ? '표시' : '숨김', () => {
      guest.hidden = !guest.hidden;
      updateGuests();
    }));
    list.append(row);
  });
}

function updateGuests() {
  save();
  renderGuestList();
  if (index === 3) render();
}

get('score-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.scores = houses.map((_, i) => Number(data.get('score' + i)));
  save();
  if (index === 18) render();
  else notifyPresenter();
  get('operator').close();
});
get('guest-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = data.get('guest').trim();
  const role = data.get('role').trim();
  if (!name || !role) return;
  state.guests.push({ name, role });
  form.reset();
  updateGuests();
});
get('staff').addEventListener('click', openOperator);
get('contents').addEventListener('click', () => get('agenda').showModal());
get('prev').addEventListener('click', () => go(index - 1));
get('next').addEventListener('click', () => go(index + 1));
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
slides.forEach(([chapter], i) => {
  const item = node('li');
  item.append(button(chapter, () => {
    get('agenda').close();
    go(i);
  }));
  get('agenda-list').append(item);
});
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.target.matches('input,video,textarea,select')) return;
  if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(slides.length - 1);
    else go(index + (['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1));
  } else if (event.key.toLowerCase() === 'f') fullscreen();
  else if (event.key.toLowerCase() === 'o') openOperator();
  else if (event.key === ' ' && event.target === document.body) {
    event.preventDefault();
    runCue();
  }
});
function restorePosition() {
  const position = Number(location.hash.match(/^#p(\d+)$/)?.[1]);
  index = position >= 1 && position <= slides.length ? position - 1 : 0;
  if (index === 8) {
    chosenCandidate = null;
    answerLocked = false;
  }
  staged = Boolean(presenterWindow && !presenterWindow.closed);
  revealed = false;
  setCaption('');
  render();
  if (index < slides.length - 1) {
    const preload = new Image();
    preload.src = './scenes/p' + String(index + 2).padStart(2, '0') + '.webp';
  }
}
addEventListener('hashchange', restorePosition);
addEventListener('storage', event => {
  if (event.key !== storeKey) return;
  state = readState();
  if (index === 3 || index === 18) render();
});
restorePosition();
