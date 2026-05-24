// 자해/자살 관련 키워드 감지 (한/영)

const SELF_HARM_PATTERNS_KO = [
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

const SELF_HARM_PATTERNS_EN = [
  /\bsuicide\b/i,
  /\bkill\s+myself\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[\s-]?harm\b/i,
  /\bend\s+it\s+all\b/i,
  /\bnot\s+worth\s+living\b/i,
  /\bhurt\s+myself\b/i,
  /\bcan'?t\s+go\s+on\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
];

export function detectSelfHarm(text) {
  if (!text) return false;
  return SELF_HARM_PATTERNS_KO.some((p) => p.test(text)) ||
         SELF_HARM_PATTERNS_EN.some((p) => p.test(text));
}

// 욕설 필터 (한/영)
const PROFANITY_PATTERNS_KO = [
  /씨발|시발|ㅅㅂ|ㅆㅂ/i,
  /개새|개색/i,
  /병신|ㅄ|ㅂㅅ/i,
  /좆|존나/i,
  /지랄/i,
];

const PROFANITY_PATTERNS_EN = [
  /\bf+u+c+k+/i,
  /\bs+h+i+t+/i,
  /\bb+i+t+c+h+/i,
  /\ba+s+s+h+o+l+e+/i,
];

export function hasProfanity(text) {
  if (!text) return false;
  return PROFANITY_PATTERNS_KO.some((p) => p.test(text)) ||
         PROFANITY_PATTERNS_EN.some((p) => p.test(text));
}

// 신상 정보 추정 패턴
const PERSONAL_INFO_PATTERNS = [
  /\d{3}-?\d{3,4}-?\d{4}/,         // 전화번호 (한국)
  /\d{6}-?\d{7}/,                   // 주민번호
  /[\w.-]+@[\w.-]+\.\w+/,          // 이메일
  /\+\d{1,3}\s?\d{3,}/,             // 국제전화
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/, // 미국 전화
];

export function hasPersonalInfo(text) {
  if (!text) return false;
  return PERSONAL_INFO_PATTERNS.some((p) => p.test(text));
}
