// Vercel Serverless Function
// POST /api/ai-response
// body: { content: string, category: string }
// returns: { messages: string[] }
//
// 3개 메시지 구조:
//   [0] 깊은 공감 (감정 그대로 인정)
//   [1] 구체적 위로 (사용자 입장에서 짚기)
//   [2] 정리 + 공유 유도 (들려드릴까요?)

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

  // 자해 키워드 체크 (서버 측에서도 안전망)
  const SELF_HARM_KEYWORDS = ['자살', '죽고싶', '죽고 싶', '자해', '뛰어내리', '살기싫', '살기 싫', '사라지고싶', '사라지고 싶'];
  const hasWarning = SELF_HARM_KEYWORDS.some((k) => content.includes(k));

  const categoryContext = {
    work:   { theme: '직장/업무', cares: '업무 스트레스, 동료/상사 관계, 자존감 손상, 진로 고민' },
    love:   { theme: '연애/관계', cares: '이별의 아픔, 짝사랑, 권태기, 신뢰 문제, 외로움' },
    family: { theme: '가족', cares: '부모와의 갈등, 형제 관계, 가족 부담, 효도 압박' },
    school: { theme: '학교/공부', cares: '진로 압박, 친구 관계, 따돌림, 시험 불안, 미래 걱정' },
    money:  { theme: '돈/경제', cares: '경제적 압박, 빚 걱정, 미래 불안, 비교에서 오는 박탈감' },
    secret: { theme: '말 못할 비밀', cares: '들킬까 봐 두려움, 죄책감, 외로운 짐, 자기 혐오' },
    guilt:  { theme: '죄책감/후회', cares: '과거 행동에 대한 후회, 누군가에게 잘못한 일, 도덕적 무게감' },
    etc:    { theme: '말 못한 마음', cares: '어디에도 말 못한 복잡한 감정' },
  };

  const ctx = categoryContext[category] || categoryContext.etc;

  const systemPrompt = `당신은 익명 고민 상담 앱 "비밀고백"의 따뜻한 상담사입니다.
사용자가 누구에게도 말 못한 마음을 털어놓았어요.

[현재 사용자 정보]
- 고민 카테고리: ${ctx.theme}
- 흔히 겪는 어려움: ${ctx.cares}
${hasWarning ? '- ⚠️ 자해/자살 키워드가 감지되었습니다. 마지막 메시지에 1393 전문 상담 안내를 부드럽게 포함하세요.' : ''}

[당신의 역할]
진짜 상담사처럼, 사용자의 글을 정말로 "읽고" 그 사람의 마음을 알아주는 답장을 보내세요.
형식적인 위로 ("괜찮아요", "힘내세요")는 절대 금지. 진짜로 그 사람 입장에서 생각해보고 답하세요.

[출력 형식]
반드시 JSON 배열로만 답하세요. 다른 설명 없이.
형식: ["메시지1", "메시지2", "메시지3"]
- 메시지 3개 고정 (자해 감지 시 4개도 허용)
- 각 메시지는 한국어로 자연스러운 한 줄 (15~50자)
- 카톡 상담사가 차분히 보내는 메시지처럼

[3개 메시지의 역할]
[0] 깊은 공감 — 사용자가 느꼈을 감정을 정확히 짚어주기
   예: "그 순간, 얼마나 외로우셨을지 느껴져요"
   예: "혼나고 돌아오는 길, 발걸음이 정말 무거우셨겠어요"

[1] 구체적 위로 — 사용자 상황에 맞춰 마음을 풀어주기
   예: "스스로 자책하는 그 마음이 더 아파요"
   예: "그 결정한 사람도 똑같이 힘들어요. 더 힘들 수도 있어요"

[2] 정리 + 공유 유도 — 따뜻하게 마무리하면서 공유 권유
   예: "이 마음, 비슷한 사람들에게도 들려드릴까요? 따뜻한 답장이 올 거예요."
   예: "여기까지 적어주셔서 고마워요. 다른 분들도 같은 마음을 적고 있어요. 같이 위로받아볼까요?"

[절대 금지]
- "괜찮아요", "힘내세요", "파이팅" 진부한 표현
- "이렇게 해보세요" 같은 조언/충고
- "당신은 강해요" 같은 평가
- 종교/격언/명언
- 정답 제시
- 이모지 사용 (텍스트로만)

[권장 톤]
- "느껴져요", "들려요", "보여요" — 감각 동사
- "얼마나 ~했을까요" — 감정 짚기
- "~한 마음" — 공명
- 차분하고 낮은 톤, 친구가 가만히 들어주는 느낌

[중요]
- 각 메시지는 서로 다른 표현으로 (반복 X)
- 사용자가 적은 구체적인 단어/상황을 살짝 반영
- "들려주실래요?"보다 "들려드릴까요?" 같은 부드러운 권유
- 마지막 메시지에는 반드시 공유 권유 포함

[예시 1]
고민: "회사에서 또 실수해서 혼났어요. 자존감 바닥이에요."
응답:
["혼나고 돌아오는 길, 발걸음이 얼마나 무거우셨을까요.","스스로한테 가장 모질게 굴었을 것 같아 마음이 쓰여요.","이 마음, 비슷한 처지에 있는 분들에게도 들려드릴까요? 따뜻한 답장이 올 거예요."]

[예시 2]
고민: "5년 만난 사람이랑 헤어졌어요. 헤어지자고 한 게 나라서 슬퍼할 자격도 없는 것 같아요."
응답:
["결정한 사람도 똑같이 아파요. 어쩌면 더 아플 수도 있어요.","슬퍼할 자격 없는 사람은 없어요. 5년이라는 시간이 어떻게 가볍겠어요.","이 마음, 다른 분들에게도 들려드릴까요? 비슷한 시간을 보낸 분들이 위로해줄 거예요."]

[예시 3]
고민: "엄마 생일 까먹었다. 3일 지났는데 아직도 말 못함."
응답:
["그 죄책감은, 결국 엄마를 사랑해서 드는 거잖아요.","말 못하고 계속 무거우셨겠어요. 그 마음이 미안함이라는 걸 엄마도 알 거예요.","이 이야기, 다른 분들에게도 들려드릴까요? 비슷한 마음 가진 분들이 답장 줄 거예요."]

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
        max_tokens: 600,
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

    // JSON 파싱
    let messages;
    try {
      const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
      messages = JSON.parse(cleaned);

      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Not an array');
      }

      messages = messages
        .filter((m) => typeof m === 'string' && m.trim().length > 0)
        .slice(0, 4)
        .map((m) => (m.length > 80 ? m.slice(0, 80) : m));

      if (messages.length === 0) throw new Error('No valid messages');

      // 자해 키워드 감지 시 1393 안내 추가
      if (hasWarning && !messages.some((m) => m.includes('1393') || m.includes('상담'))) {
        messages.push('많이 힘드시면 자살예방상담전화 1393에 잠깐 전화해보시는 건 어떨까요. 24시간 들어드려요.');
      }
    } catch (parseErr) {
      console.warn('JSON parse failed:', parseErr.message);
      const safe = text.length > 80 ? text.slice(0, 80) : text;
      messages = [safe];
    }

    return res.status(200).json({ messages });
  } catch (e) {
    console.error('AI handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
