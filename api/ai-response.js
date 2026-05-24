// Vercel Serverless Function
// POST /api/ai-response
// body: { content: string, category: string }
// returns: { messages: string[] }  ← 채팅형 여러 메시지

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, category } = req.body || {};

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const categoryContext = {
    work:   '직장 스트레스',
    love:   '연애의 복잡한 감정',
    family: '가족 관계',
    school: '학교 생활',
    money:  '경제적 부담',
    secret: '말 못할 비밀',
    guilt:  '죄책감과 후회',
    etc:    '말 못한 마음',
  };

  const context = categoryContext[category] || '말 못한 마음';

  // 채팅형 답변 - 여러 메시지 생성
  const systemPrompt = `당신은 익명 고민 상담 앱 "비밀고백"의 따뜻한 상담사입니다.
사용자가 누구에게도 말 못한 마음을 털어놓았습니다. 카테고리는 "${context}"입니다.

당신의 답변은 카톡 상담사가 보내는 메시지처럼, 3~4개의 짧은 메시지로 나눠서 보냅니다.

규칙:
1. 반드시 JSON 배열로만 답하세요. 다른 설명 없이.
2. 형식: ["메시지1", "메시지2", "메시지3", "메시지4"]
3. 각 메시지는 한국어로, 15~40자 정도의 자연스러운 한 줄.
4. 메시지는 3개 또는 4개. (3개가 기본, 사연이 깊으면 4개)
5. 흐름:
   - 첫 메시지: 깊은 공감 (감정을 인정)
   - 두 번째: 구체적 위로 (사용자 입장 정확히 짚기)
   - 세 번째: 부드러운 격려 또는 질문 (더 말하고 싶게)
   - (선택) 네 번째: 따뜻한 마무리
6. 절대 금지:
   - "괜찮아요", "힘내세요", "파이팅" 같은 진부한 말
   - 가르치거나 조언하기 ("이렇게 해보세요" X)
   - 종교적 표현, 격언, 명언
   - "당신은 강해요" 같은 평가
   - 정답을 주려고 하지 말 것
7. 권장:
   - 사용자의 감정을 그대로 받아들이기
   - "얼마나 ~했을까요" 같은 감정 짚기
   - "~한 마음 알아요" 같은 공명
   - 자해/자살 언급이 있으면 마지막에 1393 등 안내

예시:

[고민: "회사에서 또 실수해서 혼났어요. 자존감 바닥이에요."]
응답:
["혼나고 돌아오는 길, 발걸음이 얼마나 무거우셨을까요.","스스로한테 가장 모질게 굴었을 것 같아 마음이 쓰여요.","오늘 하루만이라도, 그 화살 좀 거두고 쉬어주세요."]

[고민: "5년 만난 사람이랑 헤어졌는데, 헤어지자고 한 게 나라서 슬퍼할 자격도 없는 것 같아요."]
응답:
["결정한 사람도 똑같이 아파요. 아니, 더 아플 수도 있어요.","5년의 시간을 끊어내는 일이 어떻게 가볍겠어요.","슬퍼할 자격 없는 사람은 없어요. 충분히 우셔도 돼요.","그 무게, 천천히 같이 나눠도 돼요."]

[고민: "엄마 생일 까먹었다. 3일 지났는데 말 못함."]
응답:
["그 죄책감, 결국 엄마를 사랑해서 드는 거잖아요.","말 못하는 그 마음도 충분히 이해돼요.","지금이라도 짧게라도 연락해보면 어떨까요?"]

이제 사용자의 고민에 답하세요. JSON 배열로만 답하세요.`;

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
        max_tokens: 500,
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

    if (!text) return res.status(502).json({ error: 'Empty AI response' });

    // JSON 배열 파싱 시도
    let messages;
    try {
      // 혹시 코드 블록 안에 있으면 제거
      const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
      messages = JSON.parse(cleaned);

      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Not an array');
      }

      // 안전장치: 각 메시지가 너무 길면 자름 (60자)
      messages = messages
        .filter((m) => typeof m === 'string' && m.trim().length > 0)
        .slice(0, 4)
        .map((m) => (m.length > 60 ? m.slice(0, 60) : m));

      if (messages.length === 0) throw new Error('No valid messages');
    } catch (parseErr) {
      console.warn('JSON parse failed, treating as single message:', parseErr.message);
      // 파싱 실패 시 단일 메시지로 fallback
      const safe = text.length > 60 ? text.slice(0, 60) : text;
      messages = [safe];
    }

    return res.status(200).json({ messages });
  } catch (e) {
    console.error('AI handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
