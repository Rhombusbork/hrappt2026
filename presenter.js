const find = id => document.getElementById(id);
const origin = location.protocol === 'file:' ? '*' : location.origin;
const send = (action, text) => window.opener?.postMessage({ hra: 'presenter', action, text }, origin);
const buttons = [...document.querySelectorAll('[data-action]')];
const scoreForm = find('cue-score-form');
const scoreInputs = [...scoreForm.querySelectorAll('input')];
scoreForm.addEventListener('submit', event => {
  event.preventDefault();
  send('scores', scoreInputs.map(input => input.valueAsNumber));
});
buttons.forEach(button => {
  button.disabled = true;
  button.addEventListener('click', () => send(button.dataset.action, find('caption-input').value));
});

let shownIndex = -1;
window.addEventListener('message', event => {
  if (event.source !== window.opener || (origin !== '*' && event.origin !== origin)) return;
  const data = event.data;
  if (data?.hra !== 'stage') return;
  const { index, title, next, actionLabel } = data;
  const [line, direction, caption] = eventCues[index];
  scoreInputs.forEach((input, i) => { input.value = data.scores[i]; });
  find('connection').textContent = '발표 화면 연결됨 · ' + String(index + 1).padStart(2, '0') + ' / 26';
  find('cue-title').textContent = title;
  find('cue-line').textContent = line;
  find('cue-direction').textContent = direction;
  find('cue-next').textContent = next ? '다음 화면 · ' + next : '마지막 화면';
  if (shownIndex !== index) find('caption-input').value = caption;
  shownIndex = index;
  buttons.forEach(button => { button.disabled = false; });
  const action = find('cue-action');
  action.textContent = actionLabel || '장면 진행';
  action.disabled = !actionLabel;
  document.querySelector('[data-action=prev]').disabled = index === 0;
  document.querySelector('[data-action=next]').disabled = !next;
});

document.addEventListener('keydown', event => {
  if (event.target.matches('input,textarea,button,summary')) return;
  const action = { ArrowLeft: 'prev', ArrowRight: 'next', ' ': 'cue' }[event.key];
  if (!action || shownIndex < 0) return;
  event.preventDefault();
  send(action);
});

send('ready');
setTimeout(() => {
  if (shownIndex < 0) find('connection').textContent = '발표 화면에서 사회자 버튼을 눌러 이 창을 열어 주세요.';
}, 1600);
