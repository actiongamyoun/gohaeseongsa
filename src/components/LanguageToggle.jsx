import { useTranslation } from '../i18n/index.jsx';

export default function LanguageToggle({ className = '' }) {
  const { lang, toggleLang } = useTranslation();

  return (
    <button
      className={`lang-toggle ${className}`}
      onClick={toggleLang}
      aria-label="Change language"
    >
      <span className={`lang-opt ${lang === 'ko' ? 'active' : ''}`}>KO</span>
      <span className="lang-divider">·</span>
      <span className={`lang-opt ${lang === 'en' ? 'active' : ''}`}>EN</span>
    </button>
  );
}
