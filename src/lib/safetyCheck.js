// 자해/자살 관련 키워드 감지
// 감지 시 차단이 아닌 따뜻한 배너 안내

const SELF_HARM_PATTERNS = [
  /죽고\s*싶/,
  /죽어버리/,
  /자살/,
  /자해/,
  /끝내고\s*싶/,
  /사라지고\s*싶/,
  /살기\s*싫/,
  /살\s*가치/,
  /의미\s*없[다어]/,
  /버티기\s*힘들/,
  /더\s*못\s*버티/,
  /삶이\s*고통/,
];

export function detectSelfHarm(text) {
  if (!text) return false;
  return SELF_HARM_PATTERNS.some((p) => p.test(text));
}

// 욕설 필터 (간단 버전 — 추후 확장)
const PROFANITY_PATTERNS = [
  /씨발|시발|ㅅㅂ|ㅆㅂ/i,
  /개새|개색/i,
  /병신|ㅄ|ㅂㅅ/i,
  /좆|존나/i,
  /지랄/i,
];

export function hasProfanity(text) {
  if (!text) return false;
  return PROFANITY_PATTERNS.some((p) => p.test(text));
}

// 신상 정보 추정 패턴
const PERSONAL_INFO_PATTERNS = [
  /\d{3}-?\d{3,4}-?\d{4}/,         // 전화번호
  /\d{6}-?\d{7}/,                   // 주민번호
  /[\w.-]+@[\w.-]+\.\w+/,          // 이메일
];

export function hasPersonalInfo(text) {
  if (!text) return false;
  return PERSONAL_INFO_PATTERNS.some((p) => p.test(text));
}
