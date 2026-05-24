// 🎨 배경 이미지 시스템 - 자동 검증 + Fallback
// public/backgrounds/ 폴더에 bg1.jpg ~ bgN.jpg 형식으로 저장
// 다양한 확장자(.jpg, .JPG, .jpeg, .png) 모두 자동 감지

const BACKGROUND_COUNT_MAX = 10;
const EXTENSIONS = ['.jpg', '.JPG', '.jpeg', '.png', '.webp'];

// 가능한 모든 후보 (확장자별 × 번호별)
export const BACKGROUNDS_CANDIDATES = [];
for (let i = 1; i <= BACKGROUND_COUNT_MAX; i++) {
  for (const ext of EXTENSIONS) {
    BACKGROUNDS_CANDIDATES.push(`/backgrounds/bg${i}${ext}`);
  }
}

// 실제로 존재하는 이미지만 (런타임 검증 후 확정)
let availableBackgrounds = null;
let availableCheckPromise = null;
let cachedRandom = null;

/**
 * 이미지 존재 여부 검증 (HEAD 요청)
 */
async function checkImageExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 모든 후보 중 실제 존재하는 것만 찾기 (병렬)
 * - 처음 호출 시 한 번만 실행
 * - 결과는 sessionStorage에 캐싱 (다음 새로고침 시 즉시 사용)
 */
async function ensureAvailableBackgrounds() {
  // 이미 검증됨
  if (availableBackgrounds !== null) return availableBackgrounds;

  // 검증 진행 중이면 대기
  if (availableCheckPromise) return availableCheckPromise;

  // 캐시 확인 (10분 유효)
  try {
    const cached = sessionStorage.getItem('bimilgobaek_bg_check');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.cachedAt < 10 * 60 * 1000) {
        availableBackgrounds = parsed.list;
        console.log('[bg] 캐시에서 로드:', availableBackgrounds);
        return availableBackgrounds;
      }
    }
  } catch {}

  // 병렬 검증
  availableCheckPromise = (async () => {
    console.log('[bg] 배경 이미지 검증 시작...');
    const checks = await Promise.all(
      BACKGROUNDS_CANDIDATES.map(async (url) => ({
        url,
        exists: await checkImageExists(url),
      }))
    );

    const existing = checks.filter((c) => c.exists).map((c) => c.url);

    console.log('[bg] 검증 결과:');
    checks.forEach((c) => {
      console.log(`  ${c.exists ? '✅' : '❌'} ${c.url}`);
    });
    console.log(`[bg] 사용 가능: ${existing.length}개`);

    availableBackgrounds = existing;

    try {
      sessionStorage.setItem('bimilgobaek_bg_check', JSON.stringify({
        list: existing,
        cachedAt: Date.now(),
      }));
    } catch {}

    return existing;
  })();

  return availableCheckPromise;
}

/**
 * 랜덤 배경 (실제 존재하는 것만)
 * - 동기 버전: 캐시 있으면 즉시, 없으면 bg1 fallback
 */
export function getRandomBackground() {
  if (cachedRandom) return cachedRandom;

  // 캐시된 검증 결과 사용
  try {
    const cached = sessionStorage.getItem('bimilgobaek_bg_check');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.list && parsed.list.length > 0) {
        const idx = Math.floor(Math.random() * parsed.list.length);
        cachedRandom = parsed.list[idx];
        return cachedRandom;
      }
    }
  } catch {}

  // 백그라운드 검증 시작 (다음 세션부터 정확해짐)
  ensureAvailableBackgrounds().then((list) => {
    if (list.length > 0) {
      // 검증 끝나면 다음 호출부터 정확함
      console.log('[bg] 검증 완료, 다음 새로고침부터 적용됨');
    }
  });

  // 첫 방문: bg1 임시 사용
  cachedRandom = '/backgrounds/bg1.jpg';
  return cachedRandom;
}

/**
 * 비동기 버전 - 정확하지만 await 필요
 */
export async function getRandomBackgroundAsync() {
  if (cachedRandom) return cachedRandom;

  const available = await ensureAvailableBackgrounds();

  if (available.length === 0) {
    console.warn('[bg] 사용 가능한 배경이 없어요. /backgrounds/ 폴더 확인하세요.');
    return null;
  }

  const idx = Math.floor(Math.random() * available.length);
  cachedRandom = available[idx];
  return cachedRandom;
}

export function refreshBackground() {
  cachedRandom = null;
  try {
    sessionStorage.removeItem('bimilgobaek_bg_check');
  } catch {}
  availableBackgrounds = null;
  availableCheckPromise = null;
  return getRandomBackgroundAsync();
}

/**
 * 디버그 - 콘솔에서 직접 호출 가능
 * window.checkBackgrounds()
 */
if (typeof window !== 'undefined') {
  window.checkBackgrounds = async () => {
    console.log('=== 배경 이미지 진단 ===');
    const checks = await Promise.all(
      BACKGROUNDS_CANDIDATES.map(async (url) => ({
        url,
        exists: await checkImageExists(url),
      }))
    );
    console.table(checks);
    return checks;
  };
}
