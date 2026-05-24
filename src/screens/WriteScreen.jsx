import { useState, useRef, useEffect } from 'react';
import { CATEGORIES, MAX_CONFESSION_LENGTH } from '../lib/constants.js';
import { detectSelfHarm, hasProfanity, hasPersonalInfo } from '../lib/safetyCheck.js';
import { CATEGORY_ICONS, IconBack, IconCandle } from '../components/icons.jsx';
import { useTranslation } from '../i18n/index.jsx';

export default function WriteScreen({ onClose, onListen }) {
  const { t } = useTranslation();
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (content.length >= 5) {
      setShowWarning(detectSelfHarm(content));
    } else {
      setShowWarning(false);
    }
  }, [content]);

  const canSubmit = category && content.trim().length >= 5;
  const charCount = content.length;
  const overLimit = charCount > MAX_CONFESSION_LENGTH;

  function handleSubmit() {
    if (!canSubmit || overLimit) return;
    const text = content.trim();

    if (hasPersonalInfo(text)) {
      window.alert(t('write.alert_personal_info'));
      return;
    }

    if (hasProfanity(text)) {
      const ok = window.confirm(t('write.alert_profanity'));
      if (!ok) return;
    }

    onListen?.({ content: text, category });
  }

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose} aria-label={t('header.close')}>
          <IconBack />
        </button>
        <span className="header-title">{t('write.title')}</span>
        <span className="header-action-placeholder" />
      </div>

      {showWarning && (
        <div className="warning-banner">
          <div className="warning-icon">
            <IconCandle />
          </div>
          <div className="warning-content">
            <div className="warning-title">{t('write.warning_title')}</div>
            <div className="warning-text">
              {t('write.warning_text_1')}<br />
              {t('write.warning_text_2')}
            </div>
            <div className="warning-buttons">
              <a className="warning-btn" href="tel:1393">1393</a>
              <a className="warning-btn" href="tel:1388">1388</a>
              <button className="warning-btn secondary" onClick={() => setShowWarning(false)}>
                {t('write.warning_continue')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="write-screen">
        <div className="form-section">
          <span className="form-label">{t('write.category_label')}</span>
          <div className="category-grid">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.key];
              return (
                <button
                  key={cat.key}
                  className={`cat-chip ${category === cat.key ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.key)}
                >
                  {Icon && <Icon />}
                  {t(`categories.${cat.key}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-section">
          <span className="form-label">{t('write.content_label')}</span>
          <div className="diary-paper">
            <textarea
              ref={textareaRef}
              className="diary-textarea"
              placeholder={t('write.placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CONFESSION_LENGTH + 50}
              rows={6}
            />
            <div className={`char-count ${overLimit ? 'over' : ''}`}>
              {charCount} / {MAX_CONFESSION_LENGTH}
            </div>
          </div>
        </div>

        <div className="listen-hint">
          <div className="listen-hint-icon">
            <IconCandle />
          </div>
          <div className="listen-hint-text">
            <strong>{t('write.hint_strong')}</strong>
            <span>{t('write.hint_desc').split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}</span>
          </div>
        </div>

        <button
          className={`submit-btn ${canSubmit && !overLimit ? '' : 'disabled'}`}
          onClick={handleSubmit}
          disabled={!canSubmit || overLimit}
        >
          {t('write.submit')}
        </button>
      </div>
    </>
  );
}
