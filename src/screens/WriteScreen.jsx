import { useState, useRef, useEffect } from 'react';
import { CATEGORIES, MAX_CONFESSION_LENGTH } from '../lib/constants.js';
import { detectSelfHarm, hasProfanity, hasPersonalInfo } from '../lib/safetyCheck.js';

export default function WriteScreen({ onClose, onListen }) {
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const textareaRef = useRef(null);

  // 자해 키워드 실시간 감지
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

    // 신상정보 차단
    if (hasPersonalInfo(text)) {
      window.alert('전화번호/이메일 같은 개인정보가 포함되어 있어요. 익명성을 위해 제거해주세요.');
      return;
    }

    // 욕설 경고
    if (hasProfanity(text)) {
      const ok = window.confirm('욕설이 포함된 것 같아요. 그래도 진행할까요?');
      if (!ok) return;
    }

    // AI 응답 화면으로 데이터 전달
    onListen?.({ content: text, category });
  }

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose} aria-label="닫기">←</button>
        <span className="header-title">마음 적기</span>
        <span className="header-action-placeholder" />
      </div>

      {showWarning && (
        <div className="warning-banner">
          <div className="warning-content">
            <div className="warning-title">많이 힘드시죠?</div>
            <div className="warning-text">
              혼자 짊어지지 않아도 돼요.<br />
              언제든 따뜻한 손을 잡을 수 있어요.
            </div>
            <div className="warning-buttons">
              <a className="warning-btn" href="tel:1393">📞 1393</a>
              <a className="warning-btn" href="tel:1388">📞 1388</a>
              <button className="warning-btn secondary" onClick={() => setShowWarning(false)}>
                계속 쓰기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="write-screen">
        <div className="form-section">
          <span className="form-label">어떤 이야기인가요?</span>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`cat-chip ${category === cat.key ? 'selected' : ''}`}
                onClick={() => setCategory(cat.key)}
              >
                <span className="cat-chip-emoji">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <span className="form-label">조용히 적어두세요...</span>
          <div className="diary-paper">
            <textarea
              ref={textareaRef}
              className="diary-textarea"
              placeholder="여기에 마음을 적어두세요"
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
          <span className="listen-hint-icon">🕯️</span>
          <div className="listen-hint-text">
            <strong>먼저 들어드릴게요</strong>
            <span>적으신 마음에 한 줄 답장을 보낸 다음,<br />다른 분들에게 들려드릴지 다시 여쭤볼게요</span>
          </div>
        </div>

        <button
          className={`submit-btn ${canSubmit && !overLimit ? '' : 'disabled'}`}
          onClick={handleSubmit}
          disabled={!canSubmit || overLimit}
        >
          들어주세요
        </button>
      </div>
    </>
  );
}
