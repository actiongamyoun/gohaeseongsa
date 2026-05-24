import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId } from '../lib/session.js';
import { deleteMyConfession } from '../lib/confessions.js';
import { CATEGORY_MAP } from '../lib/constants.js';
import { timeAgo } from '../lib/time.js';
import { useTranslation } from '../i18n/index.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import {
  IconBack, IconHeart, IconUser, IconTrash, CATEGORY_ICONS
} from '../components/icons.jsx';

export default function MyScreen({ onClose, onOpenDetail }) {
  const { t, lang } = useTranslation();
  const [myConfessions, setMyConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, totalHugs: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMyData();
  }, []);

  async function loadMyData() {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setMyConfessions([]);
      setStats({ count: 0, totalHugs: 0 });
      setLoading(false);
      return;
    }

    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from('confession_with_stats')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      const totalHugs = list.reduce(
        (sum, c) => sum + (c.hug_count || 0) + (c.me_too_count || 0) + (c.bless_count || 0),
        0
      );
      setMyConfessions(list);
      setStats({ count: list.length, totalHugs });
    } catch (e) {
      console.error('내 이야기 로딩 실패:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const result = await deleteMyConfession(deleteTarget.id);
    if (result.success) {
      setMyConfessions((arr) => arr.filter((c) => c.id !== deleteTarget.id));
      setStats((s) => ({ ...s, count: s.count - 1 }));
      setDeleteTarget(null);
    } else {
      window.alert(result.error || 'Delete failed');
    }
    setDeleting(false);
  }

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose}><IconBack /></button>
        <span className="header-title">{t('my.title')}</span>
        <LanguageToggle />
      </div>

      <div className="my-screen">

        <div className="my-stats">
          <div className="my-stat-card">
            <div className="my-stat-icon"><IconUser /></div>
            <div className="my-stat-number">{stats.count}</div>
            <div className="my-stat-label">{t('my.stat_count')}</div>
          </div>
          <div className="my-stat-card">
            <div className="my-stat-icon"><IconHeart /></div>
            <div className="my-stat-number">{stats.totalHugs}</div>
            <div className="my-stat-label">{t('my.stat_hugs')}</div>
          </div>
        </div>

        <div className="my-section-title">{t('my.section_title')}</div>

        {loading ? (
          <div className="loading">
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
          </div>
        ) : myConfessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconHeart size={48} /></div>
            <div className="empty-state-title">{t('my.empty_title')}</div>
            <div className="empty-state-text">{t('my.empty_text')}</div>
          </div>
        ) : (
          myConfessions.map((c) => (
            <MyCard
              key={c.id}
              confession={c}
              onOpen={() => onOpenDetail?.(c)}
              onDelete={() => setDeleteTarget(c)}
            />
          ))
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          confession={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </>
  );
}

function MyCard({ confession, onOpen, onDelete }) {
  const { t, lang } = useTranslation();
  const cat = CATEGORY_MAP[confession.category] || { key: 'etc' };
  const CatIcon = CATEGORY_ICONS[confession.category];
  const commentCount = confession.comment_count || 0;
  const totalReactions =
    (confession.hug_count || 0) +
    (confession.me_too_count || 0) +
    (confession.bless_count || 0) +
    (confession.laugh_count || 0);

  return (
    <div className="my-card">
      <div className="my-card-head">
        <span className="card-category">
          {CatIcon && <CatIcon />}
          {t(`categories.${cat.key}`)}
        </span>
        <span className="card-time">{timeAgo(confession.created_at, lang)}</span>
      </div>

      <div className="my-card-content" onClick={onOpen}>
        {confession.content}
      </div>

      <div className="my-card-footer">
        <div className="my-card-stats">
          <span className="my-stat-mini">
            <IconHeart size={14} /> {totalReactions}
          </span>
          <span className="my-stat-mini">💬 {commentCount}</span>
        </div>
        <button
          className="my-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={t('my.delete_btn')}
        >
          <IconTrash size={16} />
          <span>{t('my.delete_btn')}</span>
        </button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ confession, onCancel, onConfirm, deleting }) {
  const { t } = useTranslation();
  const commentCount = confession.comment_count || 0;
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
