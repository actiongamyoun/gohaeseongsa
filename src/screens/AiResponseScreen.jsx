import { useEffect, useState, useRef } from 'react';
import { CATEGORY_MAP } from '../lib/constants.js';
import { generateAiMessages } from '../lib/ai.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId } from '../lib/session.js';
import { detectSelfHarm } from '../lib/safetyCheck.js';
import { useTranslation } from '../i18n/index.jsx';
import {
  CATEGORY_ICONS, IconBack, IconEnvelope, IconHeart
} from '../components/icons.jsx';

function pickWaitingMessage(t) {
  const messages = [
    t('ai_response.waiting_1'),
    t('ai_response.waiting_2'),
    t('ai_response.waiting_3'),
    t('ai_response.waiting_4'),
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function AiResponseScreen({ confessionDraft, onShared, onDiscarded, onBack }) {
  const { t, lang } = useTranslation();
  const [phase, setPhase] = useState('listening');
  const [aiMessages, setAiMessages] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentTyping, setCurrentTyping] = useState(null);
  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState(null);
  const [waitingMsg] = useState(() => pickWaitingMessage(t));
  const startedRef = useRef(false);
  const bodyRef = useRef(null);

  // Phase 1: 듣기 5초
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const startTime = Date.now();
    const MIN_LISTEN_TIME = 5000;

    (async () => {
      try {
        const messages = await generateAiMessages(
          confessionDraft.content,
          confessionDraft.category,
          lang
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
          const fallback = lang === 'en'
            ? ['We heard you.', "You're not alone.", 'Stay here a moment.']
            : ['당신의 이야기를 들었어요.', '혼자가 아니에요.', '여기에 잠시 머물러주세요.'];
          setAiMessages(fallback);
          setPhase('envelope-falling');
        }, remaining);
      }
    })();
  }, [confessionDraft, lang]);

  useEffect(() => {
    if (phase !== 'envelope-falling') return;
    const tm = setTimeout(() => setPhase('envelope-arrived'), 2000);
    return () => clearTimeout(tm);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'envelope-arrived') return;
    const tm = setTimeout(() => setPhase('chatting'), 2000);
    return () => clearTimeout(tm);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'chatting' || aiMessages.length === 0) return;

    let cancelled = false;
    let messageIndex = 0;

    async function showNextMessage() {
      if (cancelled || messageIndex >= aiMessages.length) {
        setTimeout(() => {
          if (!cancelled) setPhase('decision');
        }, 1500);
        return;
      }

      setShowTyping(true);
      await sleep(1500);
      if (cancelled) return;

      setShowTyping(false);
      setCurrentTyping(messageIndex);
      await sleep(100);

      const message = aiMessages[messageIndex];
      for (let i = 1; i <= message.length; i++) {
        if (cancelled) return;
        setDisplayedMessages((prev) => {
          const next = [...prev];
          next[messageIndex] = message.slice(0, i);
          return next;
        });
        await sleep(lang === 'en' ? 30 : 50);
        if (bodyRef.current && i % 5 === 0) {
          bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
        }
      }

      setCurrentTyping(null);
      messageIndex++;
      await sleep(1500);
      if (!cancelled) showNextMessage();
    }

    showNextMessage();
    return () => { cancelled = true; };
  }, [phase, aiMessages, lang]);

  async function handleShare() {
    setPhase('submitting');
    setError(null);

    if (!isSupabaseConfigured) {
      await sleep(800);
      window.alert('Demo mode — not saved.');
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
      setError(e.message || 'Failed to share.');
      setPhase('decision');
    }
  }

  function handleDiscard() {
    setPhase('discarding');
    setTimeout(() => onDiscarded?.(), 1200);
  }

  const cat = CATEGORY_MAP[confessionDraft.category] || { key: 'etc' };
  const CatIcon = CATEGORY_ICONS[confessionDraft.category];

  return (
    <div className="ai-screen">
      <div className="screen-header ai-screen-header">
        {(phase === 'listening' || phase === 'envelope-falling' || phase === 'envelope-arrived' || phase === 'submitting') ? (
          <span className="header-action-placeholder" />
        ) : (
          <button
            className="header-back-btn"
            onClick={phase === 'decision' ? handleDiscard : onBack}
            aria-label={t('header.close')}
          >
            <IconBack />
          </button>
        )}
        <span className="header-title">
          {phase === 'listening' && t('ai_response.listening')}
          {phase === 'envelope-falling' && t('ai_response.envelope_falling')}
          {phase === 'envelope-arrived' && t('ai_response.envelope_arrived')}
          {phase === 'chatting' && t('ai_response.chatting')}
          {phase === 'decision' && t('ai_response.chatting')}
          {phase === 'submitting' && t('ai_response.submitting')}
          {phase === 'discarding' && t('ai_response.discarding')}
        </span>
        <span className="header-action-placeholder" />
      </div>

      <div className="ai-screen-body" ref={bodyRef}>
        <div className="ai-confession-preview">
          <div className="preview-cat">
            {CatIcon && <CatIcon />}
            {t(`categories.${cat.key}`)}
          </div>
          <div className="preview-content">{confessionDraft.content}</div>
        </div>

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

        {phase === 'envelope-falling' && (
          <div className="envelope-falling-stage">
            <div className="envelope-falling">
              <div className="envelope-body">
                <IconEnvelope size={60} />
              </div>
            </div>
          </div>
        )}

        {phase === 'envelope-arrived' && (
          <div className="envelope-arrived-stage">
            <div className="envelope-arrived">
              <div className="envelope-sparkle">✨</div>
              <div className="envelope-body opening">
                <IconEnvelope size={60} />
              </div>
              <div className="arrived-label">{t('ai_response.envelope_arrived')}</div>
            </div>
          </div>
        )}

        {(phase === 'chatting' || phase === 'decision' || phase === 'submitting' || phase === 'discarding') && (
          <div className="chat-thread">
            <div className="chat-header">
              <div className="chat-avatar">
                <IconHeart size={20} />
              </div>
              <div className="chat-name">
                <strong>{t('ai_response.claude_name')}</strong>
                <span>{t('ai_response.claude_sub')}</span>
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

        {phase === 'decision' && (
          <div className="ai-decision">
            <div className="decision-title">
              {t('ai_response.decision_title_1')}<br />{t('ai_response.decision_title_2')}
            </div>
            <div className="decision-sub">
              {t('ai_response.decision_sub_1')}<br />
              {t('ai_response.decision_sub_2')}
            </div>

            {error && (
              <div className="error-msg" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}

            <div className="decision-buttons">
              <button className="decision-btn primary" onClick={handleShare}>
                {t('ai_response.decision_yes')}
              </button>
              <button className="decision-btn secondary" onClick={handleDiscard}>
                {t('ai_response.decision_no')}
              </button>
            </div>

            <div className="decision-hint">
              {t('ai_response.decision_hint')}
            </div>
          </div>
        )}

        {phase === 'submitting' && (
          <div className="ai-submitting">
            <div className="listening-text">{t('ai_response.submitting_text')}</div>
          </div>
        )}

        {phase === 'discarding' && (
          <div className="ai-discarding">
            <div className="listening-text">{t('ai_response.discarding_text')}</div>
          </div>
        )}

      </div>
    </div>
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
