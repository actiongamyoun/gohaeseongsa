import { useEffect, useState, useRef } from 'react';
import { CATEGORY_MAP } from '../lib/constants.js';
import { generateAiMessages } from '../lib/ai.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId } from '../lib/session.js';
import { detectSelfHarm } from '../lib/safetyCheck.js';
import { getRandomBackground } from '../lib/backgrounds.js';
import {
  CATEGORY_ICONS, IconBack, IconEnvelope, IconHeart
} from '../components/icons.jsx';

const WAITING_MESSAGES = [
  '당신의 이야기를 듣고 있어요',
  '천천히 마음을 읽고 있어요',
  '따뜻한 답장을 적고 있어요',
  '조심스럽게 답을 고르고 있어요',
];

function pickWaitingMessage() {
  return WAITING_MESSAGES[Math.floor(Math.random() * WAITING_MESSAGES.length)];
}

/**
 * 상태 흐름:
 *  - 'listening': 듣는 중 (5초)
 *  - 'envelope-falling': 봉투 떨어지는 중 (2초)
 *  - 'envelope-arrived': 봉투 도착, 봉인 풀리는 중 (2초)
 *  - 'chatting': 채팅형 답변 표시 중
 *  - 'decision': 공유 결정
 *  - 'submitting': 게시 중
 *  - 'discarding': 폐기 중
 */
export default function AiResponseScreen({ confessionDraft, onShared, onDiscarded, onBack }) {
  const [phase, setPhase] = useState('listening');
  const [aiMessages, setAiMessages] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]); // 화면에 보이는 메시지
  const [currentTyping, setCurrentTyping] = useState(null); // 지금 타이핑 중인 메시지 인덱스
  const [showTyping, setShowTyping] = useState(false); // "..." 인디케이터
  const [error, setError] = useState(null);
  const [waitingMsg] = useState(pickWaitingMessage);
  const [bgImage] = useState(getRandomBackground);
  const startedRef = useRef(false);
  const bodyRef = useRef(null);

  // === Phase 1: AI 응답 생성 + 듣기 5초 ===
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const startTime = Date.now();
    const MIN_LISTEN_TIME = 5000; // 최소 5초 듣기

    (async () => {
      try {
        const messages = await generateAiMessages(
          confessionDraft.content,
          confessionDraft.category
        );

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LISTEN_TIME - elapsed);

        setTimeout(() => {
          setAiMessages(messages);
          setPhase('envelope-falling');
        }, remaining);
      } catch (e) {
        console.error('AI 실패:', e);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LISTEN_TIME - elapsed);
        setTimeout(() => {
          setAiMessages(['당신의 이야기를 들었어요.', '혼자가 아니에요.', '여기에 잠시 머물러주세요.']);
          setPhase('envelope-falling');
        }, remaining);
      }
    })();
  }, [confessionDraft]);

  // === Phase 2: 봉투 떨어짐 (2초) ===
  useEffect(() => {
    if (phase !== 'envelope-falling') return;
    const t = setTimeout(() => setPhase('envelope-arrived'), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // === Phase 3: 봉투 도착 + 봉인 풀림 (2초) ===
  useEffect(() => {
    if (phase !== 'envelope-arrived') return;
    const t = setTimeout(() => setPhase('chatting'), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // === Phase 4: 채팅형 메시지 순차 등장 ===
  useEffect(() => {
    if (phase !== 'chatting' || aiMessages.length === 0) return;

    let cancelled = false;
    let messageIndex = 0;

    async function showNextMessage() {
      if (cancelled || messageIndex >= aiMessages.length) {
        // 모든 메시지 다 보여줬으면 결정 단계로
        setTimeout(() => {
          if (!cancelled) setPhase('decision');
        }, 1500);
        return;
      }

      // "..." 인디케이터 표시 (1.5초)
      setShowTyping(true);
      await sleep(1500);
      if (cancelled) return;

      // 인디케이터 사라지고 메시지 타이핑 시작
      setShowTyping(false);
      setCurrentTyping(messageIndex);
      await sleep(100);

      // 타이핑 시뮬레이션 (한 글자씩, 50ms 간격)
      const message = aiMessages[messageIndex];
      for (let i = 1; i <= message.length; i++) {
        if (cancelled) return;
        setDisplayedMessages((prev) => {
          const next = [...prev];
          next[messageIndex] = message.slice(0, i);
          return next;
        });
        await sleep(50);
        // 스크롤 자동 맨 아래로
        if (bodyRef.current && i % 5 === 0) {
          bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
        }
      }

      // 메시지 완료
      setCurrentTyping(null);
      messageIndex++;

      // 다음 메시지 사이 간격 (1.5초)
      await sleep(1500);
      if (!cancelled) showNextMessage();
    }

    showNextMessage();

    return () => {
      cancelled = true;
    };
  }, [phase, aiMessages]);

  async function handleShare() {
    setPhase('submitting');
    setError(null);

    if (!isSupabaseConfigured) {
      await sleep(800);
      window.alert('데모 모드라 실제 저장은 안 됐어요. Supabase 환경변수를 설정해주세요.');
      onShared?.(null);
      return;
    }

    try {
      const sessionId = getSessionId();
      const hasWarning = detectSelfHarm(confessionDraft.content);
      const aiResponseText = aiMessages.join('\n');

      const { data, error: err } = await supabase
        .from('confessions')
        .insert({
          content: confessionDraft.content,
          category: confessionDraft.category,
          is_public: true,
          session_id: sessionId,
          has_warning: hasWarning,
          ai_response: aiResponseText,
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
    setTimeout(() => onDiscarded?.(), 1200);
  }

  const cat = CATEGORY_MAP[confessionDraft.category] || { label: '기타' };
  const CatIcon = CATEGORY_ICONS[confessionDraft.category];

  return (
    <div
      className="ai-screen has-bg"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="ai-screen-overlay" />

      <div className="screen-header ai-screen-header">
        {(phase === 'listening' || phase === 'envelope-falling' || phase === 'envelope-arrived' || phase === 'submitting') ? (
          <span className="header-action-placeholder" />
        ) : (
          <button
            className="header-back-btn"
            onClick={phase === 'decision' ? handleDiscard : onBack}
            aria-label="닫기"
          >
            <IconBack />
          </button>
        )}
        <span className="header-title">
          {phase === 'listening' && '듣는 중'}
          {phase === 'envelope-falling' && '답장이 오고 있어요'}
          {phase === 'envelope-arrived' && '답장이 도착했어요'}
          {phase === 'chatting' && '답장'}
          {phase === 'decision' && '답장'}
          {phase === 'submitting' && '들려드리는 중'}
          {phase === 'discarding' && '잘 들었어요'}
        </span>
        <span className="header-action-placeholder" />
      </div>

      <div className="ai-screen-body" ref={bodyRef}>

        {/* 작성한 고민 */}
        <div className="ai-confession-preview">
          <div className="preview-cat">
            {CatIcon && <CatIcon />}
            {cat.label}
          </div>
          <div className="preview-content">{confessionDraft.content}</div>
        </div>

        {/* 듣는 중 */}
        {phase === 'listening' && (
          <div className="ai-listening">
            <div className="listening-orb">
              <div className="orb-pulse" />
              <div className="orb-inner" />
            </div>
            <div className="listening-text">{waitingMsg}</div>
            <div className="listening-dots">
              <span className="loading-dot">·</span>
              <span className="loading-dot">·</span>
              <span className="loading-dot">·</span>
            </div>
          </div>
        )}

        {/* 봉투 떨어지는 중 */}
        {phase === 'envelope-falling' && (
          <div className="envelope-falling-stage">
            <div className="envelope-falling">
              <div className="envelope-body">
                <IconEnvelope size={60} />
              </div>
            </div>
          </div>
        )}

        {/* 봉투 도착 + 봉인 풀림 */}
        {phase === 'envelope-arrived' && (
          <div className="envelope-arrived-stage">
            <div className="envelope-arrived">
              <div className="envelope-sparkle">✨</div>
              <div className="envelope-body opening">
                <IconEnvelope size={60} />
              </div>
              <div className="arrived-label">답장이 도착했어요</div>
            </div>
          </div>
        )}

        {/* 채팅형 답변 */}
        {(phase === 'chatting' || phase === 'decision' || phase === 'submitting' || phase === 'discarding') && (
          <div className="chat-thread">
            <div className="chat-header">
              <div className="chat-avatar">
                <IconHeart size={20} />
              </div>
              <div className="chat-name">
                <strong>Claude</strong>
                <span>참고용 답변</span>
              </div>
            </div>

            {displayedMessages.map((msg, idx) => (
              msg && (
                <div key={idx} className="chat-bubble chat-bubble-ai">
                  {msg}
                  {currentTyping === idx && idx < aiMessages.length && (
                    <span className="cursor">|</span>
                  )}
                </div>
              )
            ))}

            {showTyping && (
              <div className="chat-bubble chat-bubble-typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            )}
          </div>
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
                {error}
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

        {phase === 'submitting' && (
          <div className="ai-submitting">
            <div className="listening-text">조용히 들려드리는 중...</div>
          </div>
        )}

        {phase === 'discarding' && (
          <div className="ai-discarding">
            <div className="listening-text">조용히 마음에 묻어둘게요</div>
          </div>
        )}

      </div>
    </div>
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
