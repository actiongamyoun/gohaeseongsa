// 상대 시간 표시 - 언어별
import { getCurrentLang } from '../i18n/index.jsx';

export function timeAgo(date, lang) {
  const useLang = lang || getCurrentLang();
  const now = new Date();
  const then = new Date(date);
  const sec = Math.floor((now - then) / 1000);

  if (useLang === 'en') {
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return min === 1 ? '1 min ago' : `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr === 1 ? '1 hour ago' : `${hr} hours ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return day === 1 ? '1 day ago' : `${day} days ago`;
    const week = Math.floor(day / 7);
    if (week < 5) return week === 1 ? '1 week ago' : `${week} weeks ago`;
    const month = Math.floor(day / 30);
    if (month < 12) return month === 1 ? '1 month ago' : `${month} months ago`;
    const year = Math.floor(day / 365);
    return year === 1 ? '1 year ago' : `${year} years ago`;
  }

  // 한국어
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

export function diaryDate(date, lang) {
  const useLang = lang || getCurrentLang();
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = d.getHours();

  if (useLang === 'en') {
    const timeLabel = h < 6 ? 'dawn' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
    return `${y}.${m}.${day} — ${timeLabel} diary`;
  }

  const timeLabel = h < 6 ? '새벽' : h < 12 ? '아침' : h < 18 ? '오후' : '저녁';
  return `${y}.${m}.${day} — ${timeLabel}의 일기`;
}
