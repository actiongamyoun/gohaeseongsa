// 🎨 배경 이미지 시스템
// public/backgrounds/ 폴더에 bg1.jpg ~ bgN.jpg 형식으로 저장
// 더 추가하고 싶으면 아래 BACKGROUND_COUNT 숫자만 늘리면 됨

const BACKGROUND_COUNT = 6; // 현재 등록된 이미지 수

// 모든 배경 이미지 경로
export const BACKGROUNDS = Array.from(
  { length: BACKGROUND_COUNT },
  (_, i) => `/backgrounds/bg${i + 1}.jpg`
);

// 세션 내에서 한 번 선택된 배경은 유지
let cachedRandom = null;

export function getRandomBackground() {
  if (cachedRandom) return cachedRandom;
  const idx = Math.floor(Math.random() * BACKGROUNDS.length);
  cachedRandom = BACKGROUNDS[idx];
  return cachedRandom;
}

// 매번 새로 (각 화면별 다른 배경을 원할 때)
export function getFreshRandomBackground() {
  const idx = Math.floor(Math.random() * BACKGROUNDS.length);
  return BACKGROUNDS[idx];
}

// 특정 인덱스의 배경 (디버깅용)
export function getBackground(index) {
  return BACKGROUNDS[index % BACKGROUNDS.length];
}

// 세션 새로고침 (필요시)
export function refreshBackground() {
  cachedRandom = null;
  return getRandomBackground();
}
