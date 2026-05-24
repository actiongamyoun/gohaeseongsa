import { useEffect, useState, useRef } from 'react';
import { CATEGORY_MAP } from '../lib/constants.js';
import { generateAiResponse } from '../lib/ai.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId } from '../lib/session.js';
import { detectSelfHarm } from '../lib/safetyCheck.js';

// 5가지 연출 타입
const ANIMATION_TYPES = ['envelope', 'candle', 'petals', 'paper-fold', 'star-shower'];

function pickRandomAnimation() {
  return ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)];
}

// 대기 중 보여줄 메시지 (랜덤)
const WAITING_MESSAGES = [
  '당신의 이야기를 듣고 있어요...',
  '천천히 마음을 읽고 있어요...',
  '따뜻한 답장을 적고 있어요...',
  '조심스럽게 답을 고르고 있어요...',
  '한 글자 한 글자 적고 있어요...',
];

function pickWaitingMessage() {
  return WAITING_MESSAGES[Math.floor(Math.random() * WAITING_MESSAGES.length)];
}

export default function AiResponseScreen({ confessionDraft, onShared, onDiscarded, onBack }) {
  // 'waiting' | 'revealing' | 'decision' | 'submitting' | 'discarding'
  const [phase, setPhase] = useState('waiting');
  const [aiResponse, setAiResponse] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [animation] = useState(pickRandomAnimation);
  const [waitingMsg] = useState(pickWaitingMessage);
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  // 1단계: AI 응답 생성 + 최소 3~5초 대기
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const minWait = 3000 + Math.floor(Math.random() * 2000); // 3~5초
    const startTime = Date.now();

    (async () => {
      try {
        const response = await generateAiResponse(
          confessionDraft.content,
          confessionDraft.category
        );

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minWait - elapsed);

        // 최소 대기 시간 채우기
        setTimeout(() => {
          if (response) {
            setAiResponse(response);
            setPhase('revealing');
          } else {
            // AI 실패해도 fallback 메시지로 진행
            setAiResponse('당신의 이야기를 들었어요. 혼자가 아니에요.');
            setPhase('revealing');
          }
        }, remaining);
      } catch (e) {
        console.error('AI 응답 실패:', e);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minWait - elapsed);
        setTimeout(() => {
          setAiResponse('당신의 이야기를 들었어요. 혼자가 아니에요.');
          setPhase('revealing');
        }, remaining);
      }
    })();
  }, [confessionDraft]);

  // 2단계: 응답 텍스트 타자기 효과로 표시
  useEffect(() => {
    if (phase !== 'revealing' || !aiResponse) return;

    let i = 0;
    setDisplayText('');
    const interval = setInterval(() => {
      i++;
      setDisplayText(aiResponse.slice(0, i));
      if (i >= aiResponse.length) {
        clearInterval(interval);
        // 응답이 다 나타난 후 잠시 대기 후 결정 단계로
        setTimeout(() => setPhase('decision'), 800);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [phase, aiResponse]);

  async function handleShare() {
    setPhase('submitting');
    setError(null);

    if (!isSupabaseConfigured) {
      await new Promise((r) => setTimeout(r, 800));
      window.alert('데모 모드라 실제 저장은 안 됐어요. Supabase 환경변수를 설정해주세요.');
      onShared?.(null);
      return;
    }

    try {
      const sessionId = getSessionId();
      const hasWarning = detectSelfHarm(confessionDraft.content);

      const { data, error: err } = await supabase
        .from('confessions')
        .insert({
          content: confessionDraft.content,
          category: confessionDraft.category,
          is_public: true,
          session_id: sessionId,
          has_warning: hasWarning,
          ai_response: aiResponse,
        })
        .select()
        .single();

      if (err) throw err;
      onShared?.(data);
    } catch (e) {
      console.error('게시 실패:', e);
      setError(e.message || '게시에 실패했어요.');
      setPhase('decision');
    }
  }

  function handleDiscard() {
    setPhase('discarding');
    setTimeout(() => onDiscarded?.(), 800);
  }

  const cat = CATEGORY_MAP[confessionDraft.category] || { emoji: '🤷', label: '기타' };

  return (
    <div className={`ai-screen ai-anim-${animation}`}>
      {/* 헤더 (간소화 — 대기/공개 중엔 뒤로가기 숨김) */}
      <div className="screen-header ai-screen-header">
        {(phase === 'waiting' || phase === 'submitting') ? (
          <span className="header-action-placeholder" />
        ) : (
          <button
            className="header-back-btn"
            onClick={phase === 'decision' ? handleDiscard : onBack}
            aria-label="닫기"
          >
            ←
          </button>
        )}
        <span className="header-title">
          {phase === 'waiting' && '듣는 중...'}
          {phase === 'revealing' && '답장이 왔어요'}
          {phase === 'decision' && '답장이 왔어요'}
          {phase === 'submitting' && '들려드리는 중...'}
          {phase === 'discarding' && '잘 들었어요'}
        </span>
        <span className="header-action-placeholder" />
      </div>

      {/* 백그라운드 애니메이션 (랜덤) */}
      <div className="ai-bg-animation">
        {animation === 'petals' && (
          <>
            <span className="petal petal-1">🌸</span>
            <span className="petal petal-2">🌷</span>
            <span className="petal petal-3">🌸</span>
            <span className="petal petal-4">🌼</span>
            <span className="petal petal-5">🌷</span>
          </>
        )}
        {animation === 'star-shower' && (
          <>
            <span className="star star-1">✨</span>
            <span className="star star-2">⭐</span>
            <span className="star star-3">✨</span>
            <span className="star star-4">🌟</span>
            <span className="star star-5">✨</span>
          </>
        )}
        {animation === 'candle' && (
          <div className="candle-bg">
            <span className="candle-flame">🕯️</span>
          </div>
        )}
      </div>

      <div className="ai-screen-body">

        {/* 작성한 고백 미리보기 */}
        <div className="ai-confession-preview">
          <div className="preview-cat">{cat.emoji} {cat.label}</div>
          <div className="preview-content">{confessionDraft.content}</div>
        </div>

        {/* 대기 단계 */}
        {phase === 'waiting' && (
          <div className="ai-waiting">
            <div className="waiting-icon">
              <span className="waiting-pulse">🕯️</span>
            </div>
            <div className="waiting-text">{waitingMsg}</div>
            <div className="waiting-dots">
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
            </div>
          </div>
        )}

        {/* 응답 등장 (연출별로 다름) */}
        {(phase === 'revealing' || phase === 'decision' || phase === 'submitting' || phase === 'discarding') && (
          <>
            {/* 봉투 연출 */}
            {animation === 'envelope' && (
              <div className="ai-envelope">
                <div className="envelope-front">
                  <div className="envelope-flap"></div>
                  <div className="envelope-letter">
                    <div className="letter-from">From. Claude</div>
                    <div className="letter-body">{displayText}<span className="cursor">|</span></div>
                    <div className="letter-stamp">🌷</div>
                  </div>
                </div>
              </div>
            )}

            {/* 종이 펼침 연출 */}
            {animation === 'paper-fold' && (
              <div className="ai-paper-fold">
                <div className="folded-paper">
                  <div className="paper-content">
                    <div className="paper-label">답장</div>
                    <div className="paper-body">{displayText}<span className="cursor">|</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* 촛불/꽃잎/별 연출 — 단순 카드 */}
            {(animation === 'candle' || animation === 'petals' || animation === 'star-shower') && (
              <div className="ai-simple-card">
                <div className="simple-card-label">
                  {animation === 'candle' && '🕯️ '}
                  {animation === 'petals' && '🌷 '}
                  {animation === 'star-shower' && '✨ '}
                  from Claude
                </div>
                <div className="simple-card-text">
                  {displayText}<span className="cursor">|</span>
                </div>
                <div className="simple-card-disclaimer">— 참고용 자동 응답</div>
              </div>
            )}
          </>
        )}

        {/* 결정 단계 */}
        {phase === 'decision' && (
          <div className="ai-decision">
            <div className="decision-title">
              이 이야기, 다른 분들에게도<br />들려드릴까요?
            </div>
            <div className="decision-sub">
              비슷한 마음의 사람들이<br />
              따뜻한 답장을 남겨줄 거예요
            </div>

            {error && (
              <div className="error-msg" style={{ marginTop: 16 }}>
                😢 {error}
              </div>
            )}

            <div className="decision-buttons">
              <button className="decision-btn primary" onClick={handleShare}>
                네, 들려주세요
              </button>
              <button className="decision-btn secondary" onClick={handleDiscard}>
                아니요, 여기까지
              </button>
            </div>

            <div className="decision-hint">
              아니요를 선택하면 적은 이야기는 저장되지 않아요
            </div>
          </div>
        )}

        {/* 제출 중 */}
        {phase === 'submitting' && (
          <div className="ai-submitting">
            <div className="waiting-text">조용히 들려드리는 중...</div>
          </div>
        )}

        {/* 폐기 중 */}
        {phase === 'discarding' && (
          <div className="ai-discarding">
            <div className="waiting-text">
              조용히 마음에 묻어둘게요 🌷
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
