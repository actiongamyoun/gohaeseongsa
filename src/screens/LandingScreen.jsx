import { useEffect, useState } from 'react';
import { CATEGORIES } from '../lib/constants.js';
import { CATEGORY_ICONS, IconLock, IconHeart, IconCandle, IconCheer } from '../components/icons.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useTranslation } from '../i18n/index.jsx';
import { getLandingStats, formatStatNumber } from '../lib/stats.js';

export default function LandingScreen({ onEnter, onAdmin }) {
  const { t, lang } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getLandingStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="landing-scroll">
      {/* 언어 토글 - 우상단 고정 */}
      <div className="landing-lang-toggle">
        <LanguageToggle />
      </div>

      {/* ===== Hero ===== */}
      <section className="landing-hero">
        <div className="hero-brand-script">{t('brand.name_en')}</div>
        <h1 className={`hero-title ${lang === 'en' ? 'hero-title-en' : ''}`}>
          {t('landing.hero_title')}
        </h1>
        <p className="hero-tagline">
          {t('landing.hero_tagline_1')}<br />
          {t('landing.hero_tagline_2')}
        </p>
        <p className="hero-sub">
          {t('landing.hero_sub_1')}<br />
          {t('landing.hero_sub_2')}
        </p>

        {/* 통계 카드 - 오늘 + 누적 */}
        {stats && (
          <div className="hero-stats">
            <div className="hero-stat-today">
              <span className="hero-stat-icon">✨</span>
              <span className="hero-stat-text">
                {stats.todayCount > 0
                  ? t('landing.stats_today', { count: formatStatNumber(stats.todayCount, lang) })
                  : t('landing.stats_today_zero')}
              </span>
            </div>
            {stats.totalCount > 0 && (
              <div className="hero-stat-total">
                {t('landing.stats_total', { count: formatStatNumber(stats.totalCount, lang) })}
              </div>
            )}
          </div>
        )}

        <button className="hero-cta" onClick={onEnter}>
          {t('landing.cta_primary')}
        </button>
        <div className="hero-cta-sub">{t('landing.cta_sub')}</div>
        <div className="hero-manifesto">
          {t('landing.manifesto_1')}<br />
          <strong>{t('landing.manifesto_2')}</strong>{t('landing.manifesto_3')}
        </div>
      </section>

      {/* ===== 카테고리 ===== */}
      <section className="landing-section">
        <div className="section-script">{t('landing.categories_script')}</div>
        <h2 className="section-title">{t('landing.categories_title')}</h2>

        <div className="category-showcase">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.key];
            return (
              <div key={cat.key} className="cat-showcase-item">
                {Icon && <div className="cat-showcase-icon"><Icon /></div>}
                <span className="cat-showcase-label">{t(`categories.${cat.key}`)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 약속 ===== */}
      <section className="landing-section landing-section-cream">
        <div className="section-script">{t('landing.promise_script')}</div>
        <h2 className="section-title">{t('landing.promise_title')}</h2>

        <div className="promises">
          <div className="promise">
            <div className="promise-icon"><IconLock /></div>
            <div>
              <div className="promise-title">{t('landing.promise_anon_title')}</div>
              <div className="promise-desc">{t('landing.promise_anon_desc')}</div>
            </div>
          </div>
          <div className="promise">
            <div className="promise-icon"><IconHeart /></div>
            <div>
              <div className="promise-title">{t('landing.promise_listen_title')}</div>
              <div className="promise-desc">{t('landing.promise_listen_desc')}</div>
            </div>
          </div>
          <div className="promise">
            <div className="promise-icon"><IconCheer /></div>
            <div>
              <div className="promise-title">{t('landing.promise_share_title')}</div>
              <div className="promise-desc">{t('landing.promise_share_desc')}</div>
            </div>
          </div>
          <div className="promise">
            <div className="promise-icon"><IconCandle /></div>
            <div>
              <div className="promise-title">{t('landing.promise_help_title')}</div>
              <div className="promise-desc">{t('landing.promise_help_desc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="landing-final">
        <h2 className="final-title">
          {t('landing.final_title_1')}<br />{t('landing.final_title_2')}
        </h2>
        <p className="final-sub">
          {t('landing.final_sub_1')}<br />
          {t('landing.final_sub_2')}
        </p>
        <button className="hero-cta hero-cta-final" onClick={onEnter}>
          {t('landing.final_cta')}
        </button>
      </section>

      {/* ===== Footer ===== */}
      <footer className="landing-footer">
        <div className="footer-disclaimer">
          <strong>{t('landing.footer_disclaimer_title')}</strong>
          <p>
            {t('landing.footer_disclaimer_1')}<br />
            {t('landing.footer_disclaimer_2')}<br />
            {t('landing.footer_disclaimer_3')}
          </p>
          <div className="footer-helplines">
            <a href="tel:1393" className="helpline">{t('landing.helpline_1')}</a>
            <a href="tel:1388" className="helpline">{t('landing.helpline_2')}</a>
            <a href="tel:1577-0199" className="helpline">{t('landing.helpline_3')}</a>
          </div>
        </div>
        <div className="footer-copy">
          © 2026 {t('brand.name_en')}
          {onAdmin && <span className="admin-dot" onClick={onAdmin}>·</span>}
        </div>
      </footer>

    </div>
  );
}
