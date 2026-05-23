// Vercel Serverless Function
// POST /api/ai-response
// body: { content: string, category: string }
// returns: { response: string }

export default async function handler(req, res) {
  // CORS (같은 도메인이면 불필요하지만 안전하게)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, category } = req.body || {};

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 카테고리별 톤 가이드
  const categoryTone = {
    work:   '직장 스트레스에 공감하는',
    love:   '연애의 복잡한 감정을 이해하는',
    family: '가족 관계의 미묘함을 아는',
    school: '학교 생활의 막막함을 이해하는',
    money:  '경제적 부담에 공감하는',
    secret: '비밀을 지켜주는',
    guilt:  '죄책감을 위로하는',
    etc:    '따뜻한',
  };

  const tone = categoryTone[category] || '따뜻한';

  const systemPrompt = `당신은 익명 고백 앱 "비밀고백"의 위로 도우미입니다.

규칙:
1. 사용자의 고백에 대해 ${tone} 한 마디 반응을 보내세요.
2. 반드시 한국어로, 30자 이내의 짧은 한 줄로만 답하세요.
3. 따뜻하고 부드러운 톤을 유지하세요.
4. 가르치려 하거나 조언하지 마세요. 공감 위주로.
5. 종교적 표현, 격언, 명언 사용 금지.
6. 이모지는 최대 1개까지만 사용 가능 (선택사항).
7. "괜찮아요", "힘내세요" 같은 진부한 표현보다 구체적 공감을 우선하세요.
8. 자해/자살 언급이 있으면, 전문 상담을 부드럽게 권유하세요.

예시:
- 고백: "회사에서 또 실수해서 혼났어요"
- 응답: "오늘 하루 정말 길었겠다 🌙"

- 고백: "엄마한테 짜증냈는데 죄책감 들어요"
- 응답: "그 마음 알아챈 것만으로 충분해요"

이제 사용자의 고백에 한 줄로만 답하세요. 다른 말은 하지 마세요.`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        system: systemPrompt,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Claude API error:', apiRes.status, errText);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await apiRes.json();
    const text = data?.content?.[0]?.text?.trim() || '';

    if (!text) {
      return res.status(502).json({ error: 'Empty AI response' });
    }

    // 응답 길이 안전장치 (50자 초과면 자름)
    const safeText = text.length > 50 ? text.slice(0, 50) + '...' : text;

    return res.status(200).json({ response: safeText });
  } catch (e) {
    console.error('AI handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
