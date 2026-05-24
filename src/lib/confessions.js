// 고백 관리 유틸 함수
import { supabase, isSupabaseConfigured } from './supabase.js';
import { getSessionId } from './session.js';

/**
 * 본인 고백 삭제 (soft delete)
 * - 세션 ID가 일치하는 본인 글만 삭제 가능
 * - is_deleted = true 플래그만 변경 (실제 DB 삭제는 X)
 */
export async function deleteMyConfession(confessionId) {
  if (!isSupabaseConfigured) {
    console.warn('[delete] Supabase 미설정');
    return { success: false, error: 'demo mode' };
  }

  const sessionId = getSessionId();

  try {
    const { data, error } = await supabase
      .from('confessions')
      .update({ is_deleted: true })
      .eq('id', confessionId)
      .eq('session_id', sessionId) // 본인 글만 가능 (보안)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return { success: false, error: '본인이 작성한 글만 삭제할 수 있어요.' };
    }
    return { success: true };
  } catch (e) {
    console.error('[delete] 실패:', e);
    return { success: false, error: e.message || '삭제에 실패했어요.' };
  }
}

/**
 * 본인 고백인지 확인
 */
export function isMyConfession(confession) {
  if (!confession) return false;
  const mySessionId = getSessionId();
  return confession.session_id === mySessionId;
}

/**
 * 댓글 개수 조회 (삭제 경고용)
 */
export async function getCommentCount(confessionId) {
  if (!isSupabaseConfigured) return 0;

  try {
    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('confession_id', confessionId)
      .eq('is_deleted', false);

    if (error) throw error;
    return count || 0;
  } catch (e) {
    console.warn('[count] 실패:', e);
    return 0;
  }
}
