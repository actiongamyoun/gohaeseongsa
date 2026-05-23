// 고백 카테고리
export const CATEGORIES = [
  { key: 'work',   emoji: '💼', label: '직장' },
  { key: 'love',   emoji: '💕', label: '연애' },
  { key: 'family', emoji: '👨‍👩‍👧', label: '가족' },
  { key: 'school', emoji: '🎓', label: '학교' },
  { key: 'money',  emoji: '💰', label: '돈' },
  { key: 'secret', emoji: '🤫', label: '비밀' },
  { key: 'guilt',  emoji: '😈', label: '죄책감' },
  { key: 'etc',    emoji: '🤷', label: '기타' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
);

// 감정 반응
export const REACTIONS = [
  { key: 'hug',    emoji: '🫂', label: '공감' },
  { key: 'laugh',  emoji: '😂', label: '웃긴다' },
  { key: 'me_too', emoji: '🙋', label: '필자도임' },
  { key: 'bless',  emoji: '🙏', label: '목사해드림' },
];

export const REACTION_MAP = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r])
);

// 글자수 제한
export const MAX_CONFESSION_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 300;

// 신고 사유
export const REPORT_REASONS = [
  { key: 'spam',          label: '스팸/광고' },
  { key: 'harassment',    label: '욕설/비방' },
  { key: 'sexual',        label: '성적인 내용' },
  { key: 'personal_info', label: '신상정보 노출' },
  { key: 'self_harm',     label: '자해/자살 우려' },
  { key: 'illegal',       label: '불법 정보' },
  { key: 'etc',           label: '기타' },
];
