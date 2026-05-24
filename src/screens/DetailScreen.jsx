import { useEffect, useState } from 'react';
import { CATEGORY_MAP, REACTIONS, MAX_COMMENT_LENGTH, REPORT_REASONS } from '../lib/constants.js';
import { timeAgo, diaryDate } from '../lib/time.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId, getAnonNickname } from '../lib/session.js';
import { hasProfanity } from '../lib/safetyCheck.js';
import {
  CATEGORY_ICONS, REACTION_ICONS, IconBack, IconReport, IconUser, IconHeart
} from '../components/icons.jsx';

function IconSend({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function DetailScreen({ confessionId, onClose, demoData }) {
  const [confession, setConfession] = useState(demoData || null);
  const [comments, setComments] = useState([]);
  const [myReactions, setMyReactions] = useState(new Set());
  const [loading, setLoading] = useState(!demoData);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  useEffect(() => {
    if (demoData) {
      setComments(DEMO_COMMENTS);
      return;
    }
    loadDetail();
  }, [confessionId]);

  async function loadDetail() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const sessionId = getSessionId();

      const [conRes, comRes, reactRes] = await Promise.all([
        supabase
          .from('confession_with_stats')
          .select('*')
          .eq('id', confessionId)
          .single(),
        supabase
          .from('comments')
          .select('*')
          .eq('confession_id', confessionId)
          .eq('is_deleted', false)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('reactions')
          .select('reaction_type')
          .eq('confession_id', confessionId)
          .eq('session_id', sessionId),
      ]);

      if (conRes.error) throw conRes.error;
      setConfession(conRes.data);
      setComments(comRes.data || []);
      setMyReactions(new Set((reactRes.data || []).map((r) => r.reaction_type)));
    } catch (e) {
      console.error('상세 로딩 실패:', e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleReaction(type) {
    if (!isSupabaseConfigured) {
      const next = new Set(myReactions);
      const has = next.has(type);
      if (has) next.delete(type);
      else next.add(type);
      setMyReactions(next);
      setConfession((c) => ({
        ...c,
        [`${type}_count`]: (c[`${type}_count`] || 0) + (has ? -1 : 1),
      }));
      return;
    }

    const sessionId = getSessionId();
    const has = myReactions.has(type);

    const next = new Set(myReactions);
    if (has) next.delete(type);
    else next.add(type);
    setMyReactions(next);
    setConfession((c) => ({
      ...c,
      [`${type}_count`]: (c[`${type}_count`] || 0) + (has ? -1 : 1),
    }));

    try {
      if (has) {
        await supabase
          .from('reactions')
          .delete()
          .eq('confession_id', confessionId)
          .eq('session_id', sessionId)
          .eq('reaction_type', type);
      } else {
        await supabase
          .from('reactions')
          .insert({
            confession_id: confessionId,
            session_id: sessionId,
            reaction_type: type,
          });
      }
    } catch (e) {
      console.error('반응 토글 실패:', e);
      loadDetail();
    }
  }

  async function submitComment() {
    const text = commentText.trim();
    if (!text || submitting) return;

    if (hasProfanity(text)) {
      const ok = window.confirm('욕설이 포함된 것 같아요. 그래도 올리시겠어요?');
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        const fakeId = 'demo-c-' + Date.now();
        setComments((arr) => [
          {
            id: fakeId,
            content: text,
            anon_nickname: getAnonNickname(),
            created_at: new Date().toISOString(),
          },
          ...arr,
        ]);
        setCommentText('');
        setSubmitting(false);
        return;
      }

      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from('comments')
        .insert({
          confession_id: confessionId,
          content: text,
          anon_nickname: getAnonNickname(sessionId),
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) throw error;
      setComments((arr) => [data, ...arr]);
      setCommentText('');
    } catch (e) {
      console.error('댓글 저장 실패:', e);
      window.alert('댓글 저장 실패: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReport(reason) {
    if (!reportTarget) return;
    try {
      if (!isSupabaseConfigured) {
        window.alert('데모 모드에서는 신고가 저장되지 않아요.');
        setShowReport(false);
        setReportTarget(null);
        return;
      }
      const sessionId = getSessionId();
      const { error } = await supabase.from('reports').insert({
        target_type: reportTarget.type,
        target_id: reportTarget.id,
        reason,
        reporter_session_id: sessionId,
      });
      if (error) throw error;
      window.alert('신고가 접수됐어요. 검토 후 조치할게요.');
    } catch (e) {
      console.error('신고 실패:', e);
      window.alert('신고 실패: ' + e.message);
    } finally {
      setShowReport(false);
      setReportTarget(null);
    }
  }

  if (loading) {
    return (
      <>
        <div className="screen-header">
          <button className="header-back-btn" onClick={onClose}><IconBack /></button>
          <span className="header-title">고백</span>
          <span className="header-action-placeholder" />
        </div>
        <div className="loading">
          <span className="loading-dot">.</span>
          <span className="loading-dot">.</span>
          <span className="loading-dot">.</span>
        </div>
      </>
    );
  }

  if (!confession) {
    return (
      <>
        <div className="screen-header">
          <button className="header-back-btn" onClick={onClose}><IconBack /></button>
          <span className="header-title">고백</span>
          <span className="header-action-placeholder" />
        </div>
        <div className="empty-state">
          <div className="empty-state-title">고백을 찾을 수 없어요</div>
        </div>
      </>
    );
  }

  const cat = CATEGORY_MAP[confession.category] || { label: '기타' };
  const CatIcon = CATEGORY_ICONS[confession.category];

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose}><IconBack /></button>
        <span className="header-title">비밀 상세</span>
        <button
          className="header-icon-btn"
          onClick={() => {
            setReportTarget({ type: 'confession', id: confession.id });
            setShowReport(true);
          }}
        >
          <IconReport />
        </button>
      </div>

      <div className="detail-screen">
        <div className="detail-confession">
          <div className="detail-author">
            <div className="detail-author-icon">
              <IconUser />
            </div>
            <div className="detail-author-info">
              <span className="detail-author-name">익명의 영혼</span>
              <span className="detail-author-meta">
                {timeAgo(confession.created_at)}
                {confession.has_warning && ' · 위로 필요'}
              </span>
            </div>
          </div>

          <div className="detail-text">{confession.content}</div>

          <div className="detail-meta">
            <span className="card-category">
              {CatIcon && <CatIcon />}
              {cat.label}
            </span>
          </div>
        </div>

        {confession.ai_response && (
          <div className="detail-ai">
            <div className="detail-ai-label">
              <IconHeart />
              from Claude
            </div>
            <div className="detail-ai-text">{confession.ai_response}</div>
          </div>
        )}

        <div className="reaction-bar">
          {REACTIONS.map((r) => {
            const Icon = REACTION_ICONS[r.key];
            return (
              <button
                key={r.key}
                className={`big-reaction ${myReactions.has(r.key) ? 'active' : ''}`}
                onClick={() => toggleReaction(r.key)}
              >
                {Icon && <Icon />}
                <span className="big-count">{confession[`${r.key}_count`] || 0}</span>
                <span className="big-label">{r.label}</span>
              </button>
            );
          })}
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <span className="comments-title">나누어준 마음들</span>
            <span className="comments-count">{comments.length}개</span>
          </div>

          {comments.length === 0 ? (
            <div className="comment-empty">
              아직 답장이 없어요. 첫 답장을 남겨주세요.
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="comment-head">
                  <span className="comment-name">{c.anon_nickname || '익명'}</span>
                  <span className="comment-time">{timeAgo(c.created_at)}</span>
                </div>
                <div className="comment-text">{c.content}</div>
                <div className="comment-footer">
                  <button
                    className="comment-report-btn"
                    onClick={() => {
                      setReportTarget({ type: 'comment', id: c.id });
                      setShowReport(true);
                    }}
                  >
                    신고
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 댓글 입력바 (하단 고정) */}
      <div className="comment-input-bar">
        <input
          type="text"
          className="comment-input"
          placeholder="따뜻한 한 마디를 남겨주세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          maxLength={MAX_COMMENT_LENGTH}
        />
        <button
          className="comment-send-btn"
          onClick={submitComment}
          disabled={!commentText.trim() || submitting}
          aria-label="댓글 보내기"
        >
          <IconSend />
        </button>
      </div>

      {showReport && (
        <ReportModal
          onClose={() => {
            setShowReport(false);
            setReportTarget(null);
          }}
          onSubmit={submitReport}
        />
      )}
    </>
  );
}

function ReportModal({ onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">신고 사유를 선택해주세요</div>
        <div className="modal-options">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.key}
              className="modal-option"
              onClick={() => onSubmit(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button className="modal-cancel" onClick={onClose}>취소</button>
      </div>
    </div>
  );
}

const DEMO_COMMENTS = [
  {
    id: 'd1',
    content: '나도 어제 울었어요. 진짜 다들 그렇게 사나봐요.',
    anon_nickname: '지나가는 리스너',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'd2',
    content: '화장실 칸막이 안에서 우는 거 너무 공감... 화이팅이에요.',
    anon_nickname: '부드러운 바람',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'd3',
    content: 'SNS에 보이는 게 다가 아니에요. 다들 어딘가 무너지고 있어요.',
    anon_nickname: '따뜻한 마음',
    created_at: new Date(Date.now() - 9000000).toISOString(),
  },
];
