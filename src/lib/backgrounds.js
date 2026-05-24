// 🎨 배경 이미지 시스템
// public/backgrounds/ 폴더에 bg1.jpg ~ bgN.jpg 형식으로 저장

const BACKGROUND_COUNT = 6; // 등록된 이미지 수 (필요시 늘리세요)

export const BACKGROUNDS = Array.from(
  { length: BACKGROUND_COUNT },
  (_, i) => `/backgrounds/bg${i + 1}.jpg`
);

let cachedRandom = null;

export function getRandomBackground() {
  if (cachedRandom) return cachedRandom;
  const idx = Math.floor(Math.random() * BACKGROUNDS.length);
  cachedRandom = BACKGROUNDS[idx];
  return cachedRandom;
}

export function getFreshRandomBackground() {
  const idx = Math.floor(Math.random() * BACKGROUNDS.length);
  return BACKGROUNDS[idx];
}

export function getBackground(index) {
  return BACKGROUNDS[index % BACKGROUNDS.length];
}

export function refreshBackground() {
  cachedRandom = null;
  return getRandomBackground();
}

// 배경 이미지 존재 여부 체크 (개발용)
export async function checkBackgroundsExist() {
  const results = [];
  for (const url of BACKGROUNDS) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      results.push({ url, exists: res.ok });
    } catch {
      results.push({ url, exists: false });
    }
  }
  return results;
}
