import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import ConfessionCard from '../components/ConfessionCard.jsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// 환경변수 없을 때 보여줄 더미 데이터 (미리보기용)
const DUMMY_CONFESSIONS = [
  {
    id: 'demo-1',
    content: '상사 험담을 단톡방에 적었는데 실수로 상사가 있는 방에 보냈다. 아직 답이 없다. 내일 출근하기 싫다...',
    category: 'work',
    ai_response: '오늘 밤은 푹 자요. 내일은 내일의 태양이 뜨니까 ☀️',
    created_at: new Date(Date.now() - 60000).toISOString(),
    hug_count: 234,
    laugh_count: 89,
    me_too_count: 12,
    bless_count: 45,
  },
  {
    id: 'demo-2',
    content: '여친 몰래 전 여친이랑 카톡 다시 한다. 그냥 안부 정도인데도 죄책감 든다.',
    category: 'love',
    ai_response: '그 죄책감이 답을 알고 있어요.',
    created_at: new Date(Date.now() - 720000).toISOString(),
    hug_count: 56,
    laugh_count: 23,
    me_too_count: 178,
    bless_count: 344,
  },
  {
    id: 'demo-3',
    content: '엄마 생일 까먹었다. 이미 3일 지났는데 아직도 말 못함.',
    category: 'family',
    ai_response: '지금이라도 전화해요. 늦은 효도는 있어도 안 한 효도는 없잖아요 🌷',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    hug_count: 89,
    laugh_count: 67,
    me_too_count: 234,
    bless_count: 567,
  },
];

export default function HomeScreen({ selectedCategory, onCategoryChange, onBack }) {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConfessions();
  }, [selectedCategory]);

  async function loadConfessions() {
    setLoading(true);
    setError(null);

    // Supabase 미설정 시 더미 데이터
    if (!isSupabaseConfigured) {
      const filtered = selectedCategory === 'all'
        ? DUMMY_CONFESSIONS
        : DUMMY_CONFESSIONS.filter((c) => c.category === selectedCategory);
      setConfessions(filtered);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('confession_with_stats')
        .select('*')
        .eq('is_public', true)
        .eq('is_deleted', false)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(30);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setConfessions(data || []);
    } catch (e) {
      console.error('고백 불러오기 실패:', e);
      setError(e.message);
      setConfessions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        onBack={onBack}
      />

      <div className="scroll-area">
        {!isSupabaseConfigured && (
          <div className="config-warning">
            <strong>🔧 데모 모드</strong>
            Supabase 환경변수가 설정되지 않아 샘플 데이터를 보여주고 있어요.<br /><br />
            Vercel 대시보드 → Settings → Environment Variables 에서{' '}
            <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>를
            추가하면 실제 데이터가 표시됩니다.
          </div>
        )}

        {loading ? (
          <div className="loading">
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-emoji">😢</div>
            <div className="empty-state-title">불러오기 실패</div>
            <div className="empty-state-text">{error}</div>
          </div>
        ) : confessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📭</div>
            <div className="empty-state-title">아직 고백이 없어요</div>
            <div className="empty-state-text">
              첫 번째 비밀고백을 적어보세요
            </div>
          </div>
        ) : (
          confessions.map((c) => <ConfessionCard key={c.id} confession={c} />)
        )}
      </div>

      <button
        className="fab"
        onClick={() => alert('작성 화면은 다음 단계에서 만들어집니다 ✍️')}
        aria-label="새 고백 작성"
      >
        ✒️
      </button>
    </>
  );
}
