import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId } from '../lib/session.js';
import { deleteMyConfession } from '../lib/confessions.js';
import { CATEGORY_MAP } from '../lib/constants.js';
import { timeAgo } from '../lib/time.js';
import {
  IconBack, IconHeart, IconUser, IconTrash, IconMore,
  CATEGORY_ICONS
} from '../components/icons.jsx';

export default function MyScreen({ onClose, onOpenDetail }) {
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
      // 목록에서 제거
      setMyConfessions((arr) => arr.filter((c) => c.id !== deleteTarget.id));
      setStats((s) => ({ ...s, count: s.count - 1 }));
      setDeleteTarget(null);
    } else {
      window.alert(result.error || '삭제에 실패했어요.');
    }
    setDeleting(false);
  }

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose}><IconBack /></button>
        <span className="header-title">내 이야기</span>
        <span className="header-action-placeholder" />
      </div>

      <div className="my-screen">

        <div className="my-stats">
          <div className="my-stat-card">
            <div className="my-stat-icon"><IconUser /></div>
            <div className="my-stat-number">{stats.count}</div>
            <div className="my-stat-label">내가 남긴 이야기</div>
          </div>
          <div className="my-stat-card">
            <div className="my-stat-icon"><IconHeart /></div>
            <div className="my-stat-number">{stats.totalHugs}</div>
            <div className="my-stat-label">받은 위로</div>
          </div>
        </div>

        <div className="my-section-title">내가 쓴 이야기</div>

        {loading ? (
          <div className="loading">
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
          </div>
        ) : myConfessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconHeart size={48} /></div>
            <div className="empty-state-title">아직 남긴 이야기가 없어요</div>
            <div className="empty-state-text">
              마음을 적으면 여기에 모여요
            </div>
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

      {/* 삭제 확인 모달 */}
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

// 내 글 카드 (삭제 버튼 포함)
function MyCard({ confession, onOpen, onDelete }) {
  const cat = CATEGORY_MAP[confession.category] || { label: '기타' };
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
          {cat.label}
        </span>
        <span className="card-time">{timeAgo(confession.created_at)}</span>
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
          aria-label="삭제"
        >
          <IconTrash size={16} />
          <span>삭제</span>
        </button>
      </div>
    </div>
  );
}

// 삭제 확인 모달
function DeleteConfirmModal({ confession, onCancel, onConfirm, deleting }) {
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
        <div className="modal-title">이 이야기를 삭제할까요?</div>

        <div className="delete-modal-content">
          "{confession.content.length > 40
            ? confession.content.slice(0, 40) + '...'
            : confession.content}"
        </div>

        {(commentCount > 0 || totalReactions > 0) && (
          <div className="delete-warning">
            {commentCount > 0 && (
              <div className="delete-warning-line">
                · 받은 답장 <strong>{commentCount}개</strong>가 함께 사라져요
              </div>
            )}
            {totalReactions > 0 && (
              <div className="delete-warning-line">
                · 받은 위로 <strong>{totalReactions}개</strong>도 함께 사라져요
              </div>
            )}
            <div className="delete-warning-bottom">
              한 번 삭제하면 되돌릴 수 없어요.
            </div>
          </div>
        )}

        <div className="delete-modal-buttons">
          <button
            className="modal-cancel"
            onClick={onCancel}
            disabled={deleting}
          >
            취소
          </button>
          <button
            className="modal-delete"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제할게요'}
          </button>
        </div>
      </div>
    </div>
  );
}
