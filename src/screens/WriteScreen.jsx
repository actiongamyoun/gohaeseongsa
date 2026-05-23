import { useState, useRef, useEffect } from 'react';
import { CATEGORIES, MAX_CONFESSION_LENGTH } from '../lib/constants.js';
import { detectSelfHarm, hasProfanity, hasPersonalInfo } from '../lib/safetyCheck.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId } from '../lib/session.js';
import { generateAiResponse } from '../lib/ai.js';

export default function WriteScreen({ onClose, onSubmitted }) {
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const textareaRef = useRef(null);

  // 입력할 때마다 자해 키워드 체크
  useEffect(() => {
    if (content.length >= 5) {
      setShowWarning(detectSelfHarm(content));
    } else {
      setShowWarning(false);
    }
  }, [content]);

  const canSubmit = category && content.trim().length >= 5 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    const text = content.trim();

    // 욕설 체크 (경고만, 차단 X)
    if (hasProfanity(text)) {
      const ok = window.confirm('욕설이 포함된 것 같아요. 그래도 올리시겠어요?');
      if (!ok) return;
    }

    // 신상정보 체크 (강한 경고)
    if (hasPersonalInfo(text)) {
      window.alert('전화번호/이메일 같은 개인정보가 포함되어 있어요. 익명성을 위해 제거해주세요.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Supabase 미설정 시 데모 모드
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 1000));
        window.alert('데모 모드라 실제로 저장되진 않았어요. Supabase 환경변수를 설정해주세요.');
        onSubmitted?.(null);
        return;
      }

      const sessionId = getSessionId();
      const hasWarning = detectSelfHarm(text);

      // 1) 고백 저장
      const { data: confession, error: insertErr } = await supabase
        .from('confessions')
        .insert({
          content: text,
          category,
          is_public: isPublic,
          session_id: sessionId,
          has_warning: hasWarning,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 2) AI 응답 생성 (비동기, 실패해도 고백 저장은 유지)
      try {
        const aiResponse = await generateAiResponse(text, category);
        if (aiResponse) {
          await supabase
            .from('confessions')
            .update({ ai_response: aiResponse })
            .eq('id', confession.id);
        }
      } catch (aiErr) {
        console.warn('AI 응답 생성 실패 (고백은 저장됨):', aiErr);
      }

      onSubmitted?.(confession);
    } catch (e) {
      console.error('고백 저장 실패:', e);
      setErrorMsg(e.message || '저장에 실패했어요. 잠시 후 다시 시도해주세요.');
      setSubmitting(false);
    }
  }

  const charCount = content.length;
  const overLimit = charCount > MAX_CONFESSION_LENGTH;

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose} aria-label="닫기">←</button>
        <span className="header-title">오늘의 고백</span>
        <button
          className={`header-action ${canSubmit && !overLimit ? '' : 'disabled'}`}
          onClick={handleSubmit}
          disabled={!canSubmit || overLimit}
        >
          {submitting ? '...' : '완료'}
        </button>
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
              <button
                className="warning-btn secondary"
                onClick={() => setShowWarning(false)}
              >
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

        <div className="toggle-row" onClick={() => setIsPublic(!isPublic)}>
          <div className="toggle-info">
            <span className="toggle-title">
              {isPublic ? '🌍 모두에게 보여주기' : '🔒 나만 보기'}
            </span>
            <span className="toggle-desc">
              {isPublic
                ? '다른 사람도 댓글을 남길 수 있어요'
                : '비밀일기처럼 나만 볼 수 있어요'}
            </span>
          </div>
          <div className={`toggle-switch ${isPublic ? 'on' : 'off'}`}>
            <div className="toggle-knob" />
          </div>
        </div>

        {errorMsg && (
          <div className="error-msg">
            😢 {errorMsg}
          </div>
        )}

        <button
          className={`submit-btn ${canSubmit && !overLimit ? '' : 'disabled'}`}
          onClick={handleSubmit}
          disabled={!canSubmit || overLimit}
        >
          {submitting ? '저장 중...' : '고백하기'}
        </button>
      </div>
    </>
  );
}
