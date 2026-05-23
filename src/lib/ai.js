// AI 응답 생성 (Vercel Serverless Function 호출)

export async function generateAiResponse(content, category) {
  try {
    const res = await fetch('/api/ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category }),
    });

    if (!res.ok) {
      console.warn('AI 응답 실패:', res.status);
      return null;
    }

    const data = await res.json();
    return data.response || null;
  } catch (e) {
    console.warn('AI 응답 호출 실패:', e);
    return null;
  }
}
