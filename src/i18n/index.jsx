// 🌍 i18n 시스템 - 한국어/영어 지원
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ko from './ko.json';
import en from './en.json';

const TRANSLATIONS = { ko, en };
const STORAGE_KEY = 'bimilgobaek_lang';

// 브라우저 언어 자동 감지
function detectLanguage() {
  try {
    // 저장된 선호도 우선
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch {}

  // 브라우저 언어 확인
  const browserLang = (navigator.language || 'en').toLowerCase();
  if (browserLang.startsWith('ko')) return 'ko';
  return 'en';
}

// Context
const I18nContext = createContext({
  lang: 'ko',
  t: (key) => key,
  setLang: () => {},
  toggleLang: () => {},
});

// Provider
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  // HTML lang 속성 동기화
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((newLang) => {
    if (!TRANSLATIONS[newLang]) return;
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}
    setLangState(newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  }, [lang, setLang]);

  const t = useCallback((key, params) => {
    return translate(lang, key, params);
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

// 훅
export function useTranslation() {
  return useContext(I18nContext);
}

// 번역 함수 (key는 'landing.hero_title' 같은 점 표기법)
function translate(lang, key, params = {}) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.ko;
  const keys = key.split('.');
  let value = dict;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 키 없으면 영어 fallback 시도
      if (lang !== 'en') {
        return translate('en', key, params);
      }
      return key; // 그래도 없으면 키 그대로
    }
  }

  if (typeof value !== 'string') return key;

  // {{name}} 같은 placeholder 치환
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    params[name] !== undefined ? params[name] : `{{${name}}}`
  );
}

// 현재 언어 가져오기 (Context 밖에서도 사용 가능)
export function getCurrentLang() {
  return detectLanguage();
}
