import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { getSessionId } from '../lib/session.js';
import ConfessionCard from '../components/ConfessionCard.jsx';
import { IconBack, IconHeart, IconUser } from '../components/icons.jsx';

export default function MyScreen({ onClose, onOpenDetail }) {
  const [myConfessions, setMyConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, totalHugs: 0 });

  useEffect(() => {
    loadMyData();
  }, []);

  async function loadMyData() {
    setLoading(true);

    if (!isSupabaseConfigured) {
      // 데모 모드
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
            <div key={c.id} onClick={() => onOpenDetail?.(c)} style={{ cursor: 'pointer' }}>
              <ConfessionCard confession={c} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
