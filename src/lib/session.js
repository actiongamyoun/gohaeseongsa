// 익명 세션 ID 관리
import { getCurrentLang } from '../i18n/index.jsx';

const SESSION_KEY = 'gohaeseongsa_session_id';

function generateSessionId() {
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
    return 'temp-' + Date.now();
  }
}

export function getAnonNickname(sessionId, lang) {
  const id = sessionId || getSessionId();
  const useLang = lang || getCurrentLang();
  const suffix = id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return useLang === 'en' ? `Anonymous#${suffix}` : `익명#${suffix}`;
}
