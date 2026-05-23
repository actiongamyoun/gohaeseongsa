// "3시간 전" 같은 상대 시간 표시
export function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const sec = Math.floor((now - then) / 1000);

  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}주 전`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}개월 전`;
  return `${Math.floor(day / 365)}년 전`;
}

// "2026.05.23 — 오후의 일기" 형식
export function diaryDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = d.getHours();
  const timeLabel = h < 6 ? '새벽' : h < 12 ? '아침' : h < 18 ? '오후' : '저녁';
  return `${y}.${m}.${day} — ${timeLabel}의 일기`;
}
