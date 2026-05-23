// 익명 세션 ID 관리
// 브라우저별 고유 ID를 localStorage에 저장
// 본인 작성글 식별 + 중복 반응 방지용

const SESSION_KEY = 'gohaeseongsa_session_id';

function generateSessionId() {
  // crypto.randomUUID 지원 안 하는 환경 대비
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateSessionId();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // localStorage 막힌 환경 (시크릿모드 등) → 임시 세션
    return 'temp-' + Date.now();
  }
}

// 익명 닉네임 생성 (세션 ID 기반, 같은 사람은 항상 같은 닉네임)
export function getAnonNickname(sessionId) {
  const id = sessionId || getSessionId();
  // 세션 ID의 마지막 4자를 16진수처럼 표시
  const suffix = id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `익명#${suffix}`;
}
