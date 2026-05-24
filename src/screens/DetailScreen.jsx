import { useEffect, useState } from 'react';
import { CATEGORY_MAP, REACTIONS, MAX_COMMENT_LENGTH, REPORT_REASONS } from '../lib/constants.js';
import { timeAgo } from '../lib/time.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId, getAnonNickname } from '../lib/session.js';
import { hasProfanity } from '../lib/safetyCheck.js';
import { deleteMyConfession, isMyConfession } from '../lib/confessions.js';
import { useTranslation } from '../i18n/index.jsx';
import {
  CATEGORY_ICONS, REACTION_ICONS, IconBack, IconReport, IconUser, IconHeart,
  IconTrash, IconMore
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
  const { t, lang } = useTranslation();
  const [confession, setConfession] = useState(demoData || null);
  const [comments, setComments] = useState([]);
  const [myReactions, setMyReactions] = useState(new Set());
  const [loading, setLoading] = useState(!demoData);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (demoData) return;
    loadDetail();
  }, [confessionId]);

  async function loadDetail() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const sessionId = getSessionId();

      const [conRes, comRes, reactRes] = await Promise.all([
        supabase.from('confession_with_stats').select('*').eq('id', confessionId).single(),
        supabase.from('comments').select('*').eq('confession_id', confessionId)
          .eq('is_deleted', false).eq('is_hidden', false)
          .order('created_at', { ascending: false }),
        supabase.from('reactions').select('reaction_type')
          .eq('confession_id', confessionId).eq('session_id', sessionId),
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
      if (has) next.delete(type); else next.add(type);
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
    if (has) next.delete(type); else next.add(type);
    setMyReactions(next);
    setConfession((c) => ({
      ...c,
      [`${type}_count`]: (c[`${type}_count`] || 0) + (has ? -1 : 1),
    }));

    try {
      if (has) {
        await supabase.from('reactions').delete()
          .eq('confession_id', confessionId).eq('session_id', sessionId).eq('reaction_type', type);
      } else {
        await supabase.from('reactions').insert({
          confession_id: confessionId, session_id: sessionId, reaction_type: type,
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
      const ok = window.confirm(t('write.alert_profanity'));
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        const fakeId = 'demo-c-' + Date.now();
        setComments((arr) => [{
          id: fakeId, content: text,
          anon_nickname: getAnonNickname(null, lang),
          created_at: new Date().toISOString(),
        }, ...arr]);
        setCommentText('');
        setSubmitting(false);
        return;
      }

      const sessionId = getSessionId();
      const { data, error } = await supabase.from('comments').insert({
        confession_id: confessionId, content: text,
        anon_nickname: getAnonNickname(sessionId, lang),
        session_id: sessionId,
      }).select().single();

      if (error) throw error;
      setComments((arr) => [data, ...arr]);
      setCommentText('');
    } catch (e) {
      console.error('댓글 저장 실패:', e);
      window.alert('Failed: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    const result = await deleteMyConfession(confession.id);
    if (result.success) {
      setShowDeleteModal(false);
      setTimeout(() => onClose?.(), 300);
    } else {
      window.alert(result.error || 'Delete failed');
      setDeleting(false);
    }
  }

  async function submitReport(reason) {
    if (!reportTarget) return;
    try {
      if (!isSupabaseConfigured) {
        window.alert(t('report_modal.alert_demo'));
        setShowReport(false);
        setReportTarget(null);
        return;
      }
      const sessionId = getSessionId();
      const { error } = await supabase.from('reports').insert({
        target_type: reportTarget.type, target_id: reportTarget.id,
        reason, reporter_session_id: sessionId,
      });
      if (error) throw error;
      window.alert(t('report_modal.alert_success'));
    } catch (e) {
      console.error('신고 실패:', e);
      window.alert('Report failed: ' + e.message);
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
          <span className="header-title">{t('detail.title')}</span>
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
          <span className="header-title">{t('detail.title')}</span>
          <span className="header-action-placeholder" />
        </div>
        <div className="empty-state">
          <div className="empty-state-title">{lang === 'en' ? 'Not found' : '고백을 찾을 수 없어요'}</div>
        </div>
      </>
    );
  }

  const cat = CATEGORY_MAP[confession.category] || { key: 'etc' };
  const CatIcon = CATEGORY_ICONS[confession.category];
  const isMine = isMyConfession(confession);

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose}><IconBack /></button>
        <span className="header-title">{t('detail.title')}</span>
        <div className="header-menu-wrap">
          <button
            className="header-icon-btn"
            onClick={() => {
              if (isMine) {
                setShowMenu(!showMenu);
              } else {
                setReportTarget({ type: 'confession', id: confession.id });
                setShowReport(true);
              }
            }}
            aria-label={isMine ? t('header.menu') : t('header.report')}
          >
            {isMine ? <IconMore /> : <IconReport />}
          </button>

          {isMine && showMenu && (
            <>
              <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
              <div className="header-menu">
                <button
                  className="header-menu-item danger"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <IconTrash size={16} />
                  <span>{t('detail.menu_delete')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="detail-screen">
        <div className="detail-confession">
          <div className="detail-author">
            <div className="detail-author-icon">
              <IconUser />
            </div>
            <div className="detail-author-info">
              <span className="detail-author-name">{t('detail.anonymous_name')}</span>
              <span className="detail-author-meta">
                {timeAgo(confession.created_at, lang)}
                {confession.has_warning && ` · ${t('detail.warning_label')}`}
              </span>
            </div>
          </div>

          <div className="detail-text">{confession.content}</div>

          <div className="detail-meta">
            <span className="card-category">
              {CatIcon && <CatIcon />}
              {t(`categories.${cat.key}`)}
            </span>
          </div>
        </div>

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
                <span className="big-label">{t(`reactions.${r.key}`)}</span>
              </button>
            );
          })}
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <span className="comments-title">{t('detail.comments_title')}</span>
            <span className="comments-count">{t('detail.comments_count', { count: comments.length })}</span>
          </div>

          {comments.length === 0 ? (
            <div className="comment-empty">{t('detail.comment_empty')}</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="comment-head">
                  <span className="comment-name">{c.anon_nickname || (lang === 'en' ? 'Anonymous' : '익명')}</span>
                  <span className="comment-time">{timeAgo(c.created_at, lang)}</span>
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
                    {t('detail.comment_report')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="comment-input-bar">
        <input
          type="text"
          className="comment-input"
          placeholder={t('detail.comment_placeholder')}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          maxLength={MAX_COMMENT_LENGTH}
        />
        <button
          className="comment-send-btn"
          onClick={submitComment}
          disabled={!commentText.trim() || submitting}
          aria-label="Send"
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

      {showDeleteModal && confession && (
        <DeleteConfirmModal
          confession={confession}
          commentCount={comments.length}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </>
  );
}

function ReportModal({ onClose, onSubmit }) {
  const { t } = useTranslation();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{t('report_modal.title')}</div>
        <div className="modal-options">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.key}
              className="modal-option"
              onClick={() => onSubmit(r.key)}
            >
              {t(`report_modal.reasons.${r.key}`)}
            </button>
          ))}
        </div>
        <button className="modal-cancel" onClick={onClose}>{t('report_modal.cancel')}</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ confession, commentCount, onCancel, onConfirm, deleting }) {
  const { t } = useTranslation();
  const totalReactions =
    (confession.hug_count || 0) +
    (confession.me_too_count || 0) +
    (confession.bless_count || 0) +
    (confession.laugh_count || 0);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon">
          <IconTrash size={36} />
        </div>
        <div className="modal-title">{t('delete_modal.title')}</div>

        <div className="delete-modal-content">
          "{confession.content.length > 40
            ? confession.content.slice(0, 40) + '...'
            : confession.content}"
        </div>

        {(commentCount > 0 || totalReactions > 0) && (
          <div className="delete-warning">
            {commentCount > 0 && (
              <div className="delete-warning-line">
                · {t('delete_modal.warning_comments', { count: commentCount })}
              </div>
            )}
            {totalReactions > 0 && (
              <div className="delete-warning-line">
                · {t('delete_modal.warning_reactions', { count: totalReactions })}
              </div>
            )}
            <div className="delete-warning-bottom">
              {t('delete_modal.warning_irreversible')}
            </div>
          </div>
        )}

        <div className="delete-modal-buttons">
          <button className="modal-cancel" onClick={onCancel} disabled={deleting}>
            {t('delete_modal.cancel')}
          </button>
          <button className="modal-delete" onClick={onConfirm} disabled={deleting}>
            {deleting ? t('delete_modal.deleting') : t('delete_modal.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
