// 카테고리 키 정의 (라벨은 i18n에서 가져옴)
export const CATEGORIES = [
  { key: 'work' },
  { key: 'love' },
  { key: 'family' },
  { key: 'school' },
  { key: 'money' },
  { key: 'secret' },
  { key: 'guilt' },
  { key: 'etc' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
);

// 감정 반응 키 정의 (라벨은 i18n에서 가져옴)
export const REACTIONS = [
  { key: 'hug',    color: 'rose' },
  { key: 'me_too', color: 'sage' },
  { key: 'bless',  color: 'mustard' },
  { key: 'laugh',  color: 'lavender' },
];

export const REACTION_MAP = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r])
);

export const MAX_CONFESSION_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 300;

// 신고 사유 키 (라벨은 i18n에서)
export const REPORT_REASONS = [
  { key: 'spam' },
  { key: 'harassment' },
  { key: 'sexual' },
  { key: 'personal_info' },
  { key: 'self_harm' },
  { key: 'illegal' },
  { key: 'etc' },
];
