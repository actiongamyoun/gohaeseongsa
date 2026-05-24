import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { CATEGORY_MAP, REPORT_REASONS } from '../lib/constants.js';
import { timeAgo } from '../lib/time.js';

const ADMIN_PASSWORD = 'admin0000';
const ADMIN_KEY = 'gohaeseongsa_admin_auth';

export default function AdminScreen({ onClose }) {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(ADMIN_KEY) === 'yes'; } catch { return false; }
  });
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, tab]);

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      try { sessionStorage.setItem(ADMIN_KEY, 'yes'); } catch {}
      setAuthed(true);
    } else {
      window.alert('비밀번호가 틀렸어요.');
      setPassword('');
    }
  }

  function logout() {
    try { sessionStorage.removeItem(ADMIN_KEY); } catch {}
    setAuthed(false);
    setPassword('');
  }

  async function loadData() {
    if (!isSupabaseConfigured) return;
    setLoading(true);

    try {
      if (tab === 'reports') {
        const { data } = await supabase
          .from('reports')
          .select('*')
          .eq('is_handled', false)
          .order('created_at', { ascending: false })
          .limit(50);
        setReports(data || []);
      } else if (tab === 'confessions') {
        const { data } = await supabase
          .from('confessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setConfessions(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function hideConfession(id) {
    if (!window.confirm('이 고백을 숨김 처리할까요?')) return;
    await supabase.from('confessions').update({ is_hidden: true }).eq('id', id);
    loadData();
  }

  async function showConfession(id) {
    await supabase.from('confessions').update({ is_hidden: false }).eq('id', id);
    loadData();
  }

  async function deleteConfession(id) {
    if (!window.confirm('이 고백을 삭제할까요? (소프트 삭제)')) return;
    await supabase.from('confessions').update({ is_deleted: true }).eq('id', id);
    loadData();
  }

  async function resolveReport(reportId, action) {
    if (!window.confirm(`신고를 ${action === 'handled' ? '처리 완료' : '무시'}로 표시할까요?`)) return;
    await supabase
      .from('reports')
      .update({
        is_handled: true,
        handled_at: new Date().toISOString(),
        admin_note: action,
      })
      .eq('id', reportId);
    loadData();
  }

  async function hideReportTarget(report) {
    if (!window.confirm(`이 ${report.target_type === 'confession' ? '고백' : '댓글'}을 숨김 처리할까요?`)) return;
    const table = report.target_type === 'confession' ? 'confessions' : 'comments';
    await supabase.from(table).update({ is_hidden: true }).eq('id', report.target_id);
    await supabase
      .from('reports')
      .update({
        is_handled: true,
        handled_at: new Date().toISOString(),
        admin_note: 'hidden',
      })
      .eq('id', report.id);
    loadData();
  }

  if (!authed) {
    return (
      <>
        <div className="screen-header">
          <button className="header-back-btn" onClick={onClose}>←</button>
          <span className="header-title">관리자</span>
          <span className="header-action-placeholder" />
        </div>
        <div className="admin-login">
          <div className="admin-login-icon">🔑</div>
          <div className="admin-login-title">관리자 인증</div>
          <input
            type="password"
            className="admin-input"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button className="admin-login-btn" onClick={handleLogin}>입장</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="screen-header">
        <button className="header-back-btn" onClick={onClose}>←</button>
        <span className="header-title">관리자</span>
        <button className="admin-logout" onClick={logout}>로그아웃</button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'reports' ? 'active' : ''}`}
          onClick={() => setTab('reports')}
        >
          신고 ({reports.length})
        </button>
        <button
          className={`admin-tab ${tab === 'confessions' ? 'active' : ''}`}
          onClick={() => setTab('confessions')}
        >
          📜 고백
        </button>
      </div>

      <div className="admin-scroll">
        {loading ? (
          <div className="loading">
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
          </div>
        ) : tab === 'reports' ? (
          reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-emoji">✨</div>
              <div className="empty-state-title">처리할 신고가 없어요</div>
            </div>
          ) : (
            reports.map((r) => {
              const reasonLabel = REPORT_REASONS.find((x) => x.key === r.reason)?.label || r.reason;
              return (
                <div key={r.id} className="admin-card">
                  <div className="admin-card-meta">
                    <span className="admin-tag">{r.target_type === 'confession' ? '고백' : '댓글'}</span>
                    <span className="admin-tag warn">{reasonLabel}</span>
                    <span className="admin-time">{timeAgo(r.created_at)}</span>
                  </div>
                  <div className="admin-card-id">ID: {r.target_id.slice(0, 8)}...</div>
                  {r.description && <div className="admin-card-desc">{r.description}</div>}
                  <div className="admin-card-actions">
                    <button onClick={() => hideReportTarget(r)} className="admin-btn danger">숨김 처리</button>
                    <button onClick={() => resolveReport(r.id, 'dismissed')} className="admin-btn">무시</button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          confessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-emoji">📭</div>
              <div className="empty-state-title">고백이 없어요</div>
            </div>
          ) : (
            confessions.map((c) => {
              const cat = CATEGORY_MAP[c.category] || { emoji: '🤷', label: '기타' };
              return (
                <div key={c.id} className="admin-card">
                  <div className="admin-card-meta">
                    <span className="admin-tag">{cat.emoji} {cat.label}</span>
                    {!c.is_public && <span className="admin-tag">비공개</span>}
                    {c.has_warning && <span className="admin-tag warn">자해 경고</span>}
                    {c.is_hidden && <span className="admin-tag warn">숨김</span>}
                    {c.is_deleted && <span className="admin-tag warn">삭제됨</span>}
                    <span className="admin-time">{timeAgo(c.created_at)}</span>
                  </div>
                  <div className="admin-card-content">{c.content}</div>
                  {c.ai_response && (
                    <div className="admin-card-ai">AI: {c.ai_response}</div>
                  )}
                  <div className="admin-card-actions">
                    {c.is_hidden
                      ? <button onClick={() => showConfession(c.id)} className="admin-btn">숨김 해제</button>
                      : <button onClick={() => hideConfession(c.id)} className="admin-btn danger">숨김</button>
                    }
                    {!c.is_deleted && (
                      <button onClick={() => deleteConfession(c.id)} className="admin-btn danger">삭제</button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </>
  );
}
