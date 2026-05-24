// 고백 카테고리
export const CATEGORIES = [
  { key: 'work',   label: '직장' },
  { key: 'love',   label: '연애' },
  { key: 'family', label: '가족' },
  { key: 'school', label: '학교' },
  { key: 'money',  label: '돈' },
  { key: 'secret', label: '비밀' },
  { key: 'guilt',  label: '죄책감' },
  { key: 'etc',    label: '기타' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
);

// 감정 반응 - 새 라벨
export const REACTIONS = [
  { key: 'hug',    label: '공감해요',   color: 'rose' },
  { key: 'me_too', label: '나도예요',   color: 'sage' },
  { key: 'bless',  label: '응원해요',   color: 'mustard' },
  { key: 'laugh',  label: '들어줬어요', color: 'lavender' },
];

export const REACTION_MAP = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r])
);

export const MAX_CONFESSION_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 300;

export const REPORT_REASONS = [
  { key: 'spam',          label: '스팸/광고' },
  { key: 'harassment',    label: '욕설/비방' },
  { key: 'sexual',        label: '성적인 내용' },
  { key: 'personal_info', label: '신상정보 노출' },
  { key: 'self_harm',     label: '자해/자살 우려' },
  { key: 'illegal',       label: '불법 정보' },
  { key: 'etc',           label: '기타' },
];
