// 📊 랜딩 통계 - 오늘/누적 마음 카운트
import { supabase, isSupabaseConfigured } from './supabase.js';

const CACHE_KEY = 'bimilgobaek_stats_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * 랜딩에 표시할 통계
 * - todayCount: 오늘 새로 작성된 고백 수
 * - totalCount: 누적 전체 고백 수
 *
 * 결과는 5분 캐싱 (DB 부하 방지)
 */
export async function getLandingStats() {
  // 캐시 확인
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.cachedAt < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch {}

  // 데모 모드용 더미 데이터
  if (!isSupabaseConfigured) {
    return {
      todayCount: 247,
      totalCount: 12847,
      isDemo: true,
    };
  }

  try {
    // 오늘 0시(KST 기준) 계산
    const now = new Date();
    const kstOffset = 9 * 60; // KST = UTC+9
    const todayKST = new Date(now.getTime() + kstOffset * 60 * 1000);
    todayKST.setUTCHours(0, 0, 0, 0);
    const todayStartUTC = new Date(todayKST.getTime() - kstOffset * 60 * 1000);

    // 병렬 쿼리
    const [todayRes, totalRes] = await Promise.all([
      // 오늘 작성된 (삭제 제외)
      supabase
        .from('confessions')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', todayStartUTC.toISOString()),
      // 누적 전체 (삭제 제외)
      supabase
        .from('confessions')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false),
    ]);

    const result = {
      todayCount: todayRes.count || 0,
      totalCount: totalRes.count || 0,
      isDemo: false,
    };

    // 캐싱
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: result,
        cachedAt: Date.now(),
      }));
    } catch {}

    return result;
  } catch (e) {
    console.warn('[stats] 조회 실패:', e);
    // 실패해도 화면은 보여줘야 함 - 적당한 fallback
    return {
      todayCount: 0,
      totalCount: 0,
      isDemo: false,
      error: true,
    };
  }
}

/**
 * 숫자 포맷팅 - "1,234" 또는 "12.8K"
 */
export function formatStatNumber(n, lang = 'ko') {
  if (n < 1000) return String(n);
  if (n < 10000) {
    return n.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US');
  }
  if (n < 1000000) {
    return lang === 'ko'
      ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}천`
      : `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return lang === 'ko'
    ? `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만`
    : `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
}
