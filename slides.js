// 슬라이드 순서와 화면 문구. 필드 설명은 작업계획/01_구조작업.md의 S1에 있다.
// 순서를 바꾸려면 이 배열의 줄만 옮기면 된다. id는 바꾸지 않는다.
const slides = [
  { id: 'cover', chapter: '입장 대기', eyebrow: 'HRA 2026  /  YEAR-END PARTY', title: '해피 크리스마스, 흐라', description: '검은 호수를 건너, 오늘 밤의 연회로.', theme: 'hero', scene: 'p01', cue: '성으로 들어가기', cueNext: true, effect: 'cover', corner: '2026.12.26  ·  JEJU' },
  { id: 'welcome', chapter: '입학 축하', theme: 'center', scene: 'p24', body: 'welcome', cue: '양피지 말기', effect: 'owl-letter' },
  { id: 'opening', chapter: '개회', eyebrow: '개회', title: '대연회장의 문이 열립니다', description: '기숙사 대항전 · 크리스마스 만찬 · 명예의 전당', theme: 'center', scene: 'p03', spare: true, after: 'welcome' },
  { id: 'guests', chapter: '내빈 소개', eyebrow: '내빈 소개', theme: 'center', scene: 'p03', body: 'guests', steps: 'auto', stepsStart: 1, stepLabel: '다음 학생증' },
  { id: 'houses', chapter: '기숙사 배정', theme: 'bare', scene: 'p06', body: 'houses', steps: 'auto', stepLabel: '배너 내리기', effect: 'banners' },
  { id: 'students', chapter: '20기 소개', eyebrow: '20기 소개', title: 'HRA 20기 학생증', description: '마법학교 신입생들을 소개합니다.', theme: 'center', scene: 'p07', body: 'students', spare: true, after: 'houses' },
  { id: 'blackout', chapter: '암전', theme: 'blackout', effect: 'blackout' },
  { id: 'quiz1-title', chapter: '1부 · 퀴즈 1 시작', eyebrow: '1부 · 퀴즈', title: '20기를 맞혀라', theme: 'center', scene: 'p08', reveal: '필름 돌리기', revealAlways: true, revealHide: ['title'], effect: 'film' },
  { id: 'quiz1-q', chapter: '20기를 맞혀라 · 문제 01', eyebrow: '20기를 맞혀라 · 문제 01', title: '전반기에 가장 많이 발표한 사람은?', description: '기숙사별로 상의한 뒤 후보를 선택하세요.', theme: 'center', scene: 'p09', body: 'quiz' },
  { id: 'quiz1-a', chapter: '20기를 맞혀라 · 정답 01', eyebrow: '20기를 맞혀라 · 정답 01', title: '정답 공개', theme: 'center', scene: 'p10', body: 'answer', reveal: '정답 공개', revealAlways: true, suspense: true },
  { id: 'rest', chapter: '쉬어가기', theme: 'bare', scene: 'p20' },
  { id: 'quiz2-title', chapter: '1부 · 퀴즈 2 시작', eyebrow: '1부 · 퀴즈', title: '교수님 어린 시절 맞히기', theme: 'center', scene: 'p11' },
  { id: 'quiz2-q', chapter: '교수님 어린 시절 · 문제 02', eyebrow: '교수님 어린 시절 · 문제 02', title: '이 어린이는 누구일까요?', theme: 'center', scene: 'p12', body: 'capsule', reveal: '상자 열기', revealAlways: true, revealHide: [], cue: '15초 시작', effect: 'capsule' },
  { id: 'quiz2-a', chapter: '교수님 어린 시절 · 정답 02', eyebrow: '교수님 어린 시절 · 정답 02', title: '정답 공개', theme: 'center', scene: 'p13', body: 'photo', reveal: '현재 사진 공개', revealAlways: true, suspense: true },
  { id: 'dinner', chapter: '만찬', eyebrow: '만찬', title: 'Time for Dinner', description: '함께 식사하며 오늘의 이야기를 나눠 주세요.', theme: 'left', scene: 'p14' },
  { id: 'video', chapter: '전반기 활동 영상', eyebrow: '20기 활동 영상', title: '전반기 활동 영상', theme: 'center', scene: 'p15', body: 'video', cue: '영상 재생' },
  { id: 'bingo', chapter: '2부 · 이름 빙고', eyebrow: '2부 · 이름 빙고', title: '이름 빙고', description: '종이 빙고판에 알맞은 사람을 적으세요', theme: 'center', scene: 'p16', body: 'bingo' },
  { id: 'bingo-timer', chapter: '2부 · 빙고 진행', eyebrow: '2부 · 빙고 진행', title: '제한 시간 15분', theme: 'center', scene: 'p17', body: 'timer', duration: 900, cue: '빙고 시작' },
  { id: 'bowling', chapter: '2부 · 물약병 볼링', eyebrow: '2부 · 물약병 볼링', title: '물약병 볼링', description: '물병이 멈춘 구간에 따라 점수를 얻습니다.', theme: 'center', scene: 'p18', body: 'bowling' },
  { id: 'scores', chapter: '2부 · 점수판', theme: 'center', scene: 'p19', body: 'scores', reveal: '순위 공개' },
  { id: 'winner', chapter: '2부 · 1위 기숙사', eyebrow: '1위', theme: 'center', scene: 'p19', body: 'winner' },
  { id: 'break', chapter: '휴식', title: 'Break Time', theme: 'center', scene: 'p20' },
  { id: 'part3', chapter: '3부 · 시상식', eyebrow: '3부 · 시상식', title: '명예의 전당', description: '오늘의 수상자들에게 축하를 전합니다.', theme: 'left', scene: ['assets/b/ballroom.jpg', 'p03'], reveal: '문 열기', revealAlways: true, revealHide: ['title', 'description'], effect: 'door' },
  { id: 'awards', chapter: '부문별 시상', eyebrow: '부문별 시상', title: '수상자를 소개합니다', theme: 'center', scene: ['assets/b/ballroom.jpg', 'p03'], body: 'awards', steps: 'auto', stepLabel: '양피지 열기', effect: 'awards' },
  { id: 'speech', chapter: '귀빈 말씀', eyebrow: '귀빈 말씀', title: '감사와 격려의 말씀', description: '교수님 격려 말씀 · 위원장 마무리 인사', theme: 'left', scene: 'p23' },
  { id: 'photo-guide', chapter: '단체사진 안내', eyebrow: '단체사진 안내', title: '무대 앞으로 모여 주세요', description: '촬영 전 아래 순서대로 자리해 주세요.', theme: 'center', scene: 'p24', body: 'rows' },
  { id: 'photo', chapter: '기념 촬영', title: 'Happy 2026', description: 'HRA Year-End Party', theme: 'center', scene: 'p01', effect: 'starfall' },
  { id: 'closing', chapter: '폐회', eyebrow: '폐회', title: '다음 목적지를 향해서', description: '오늘 밤의 여정에 함께해 주셔서 감사합니다.', theme: 'hero', scene: 'p26' },
];

// 화면에 쓰는 자료. 연출 파일에서도 HRA_DATA로 읽을 수 있다.
const HRA_DATA = {
  // 점수 순서와 같다. 색과 문장은 초대장(hra26yep.vercel.app)과 같다.
  houses: [
    { name: '그리핀도르', color: '#812D39', crest: './art/crest_house_a.png' },
    { name: '슬리데린', color: '#23654F', crest: './art/crest_house_d.png' },
    { name: '래번클로', color: '#245179', crest: './art/crest_house_c.png' },
    { name: '후플푸프', color: '#BE9139', crest: './art/crest_house_b.png' },
  ],
  bingo: [
    '흰 양말을 신은 사람', '한라산을 간 사람', '커피를 좋아하는 사람',
    '외국 문학보다 한국 문학을 선호하는 사람', '기업실무를 2번 이상 발표한 사람', '안경을 쓴 사람',
    '다른 기숙사인 사람', '피자를 좋아하는 사람', '운동이 취미인 사람',
  ],
  // 시연용. 실제 수상자가 정해지면 이름을 바꾼다. 개수만큼 양피지가 생긴다.
  awards: [
    { category: '교수님 감사장', name: '수상자 이름' },
    { category: '전반기 개근상', name: '수상자 이름' },
    { category: '최다 발표상', name: '수상자 이름' },
  ],
  // 필름에 지나갈 활동 사진. 실제 사진은 photos/activity/에 넣고 이 목록을 바꾼다. 지금은 시연용 그림이다.
  filmPhotos: [
    './portraits/candidate-1.webp', './scenes/p07.webp', './portraits/candidate-2.webp', './scenes/p05.webp',
    './portraits/candidate-3.webp', './scenes/p14.webp', './portraits/candidate-4.webp', './scenes/p03.webp',
    './portraits/adult.webp', './scenes/p18.webp', './portraits/child.webp', './scenes/p24.webp',
  ],
};
