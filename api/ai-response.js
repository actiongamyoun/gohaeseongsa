// Vercel Serverless Function - AI 응답 생성
// 한국어/영어 지원

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, category, lang = 'ko' } = req.body || {};

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  // 자해 키워드 (양 언어)
  const SELF_HARM_KO = ['자살', '죽고싶', '죽고 싶', '자해', '뛰어내리', '살기싫', '살기 싫', '사라지고싶', '사라지고 싶'];
  const SELF_HARM_EN = ['suicide', 'kill myself', 'want to die', 'self harm', 'self-harm', 'end it all', 'not worth living', 'hurt myself'];
  const hasWarning = SELF_HARM_KO.some((k) => content.includes(k)) ||
                     SELF_HARM_EN.some((k) => content.toLowerCase().includes(k));

  const isEnglish = lang === 'en';

  const categoryContextKo = {
    work:   { theme: '직장/업무', cares: '업무 스트레스, 동료/상사 관계, 자존감 손상, 진로 고민' },
    love:   { theme: '연애/관계', cares: '이별의 아픔, 짝사랑, 권태기, 신뢰 문제, 외로움' },
    family: { theme: '가족', cares: '부모와의 갈등, 형제 관계, 가족 부담, 효도 압박' },
    school: { theme: '학교/공부', cares: '진로 압박, 친구 관계, 따돌림, 시험 불안, 미래 걱정' },
    money:  { theme: '돈/경제', cares: '경제적 압박, 빚 걱정, 미래 불안, 비교에서 오는 박탈감' },
    secret: { theme: '말 못할 비밀', cares: '들킬까 봐 두려움, 죄책감, 외로운 짐, 자기 혐오' },
    guilt:  { theme: '죄책감/후회', cares: '과거 행동에 대한 후회, 누군가에게 잘못한 일, 도덕적 무게감' },
    etc:    { theme: '말 못한 마음', cares: '어디에도 말 못한 복잡한 감정' },
  };

  const categoryContextEn = {
    work:   { theme: 'work/career', cares: 'work stress, relationships with colleagues/bosses, hurt self-esteem, career anxiety' },
    love:   { theme: 'love/relationships', cares: 'heartbreak, unrequited love, growing apart, trust issues, loneliness' },
    family: { theme: 'family', cares: 'parent conflicts, sibling dynamics, family pressure, filial expectations' },
    school: { theme: 'school/study', cares: 'academic pressure, friendships, bullying, exam anxiety, future worry' },
    money:  { theme: 'money/finance', cares: 'financial pressure, debt anxiety, future fears, comparison-driven sadness' },
    secret: { theme: 'unspeakable secrets', cares: 'fear of being found out, guilt, lonely burdens, self-loathing' },
    guilt:  { theme: 'guilt/regret', cares: 'regret over past actions, harm done to others, moral weight' },
    etc:    { theme: 'unspoken feelings', cares: 'complex emotions you couldn\'t share anywhere' },
  };

  const ctx = isEnglish
    ? (categoryContextEn[category] || categoryContextEn.etc)
    : (categoryContextKo[category] || categoryContextKo.etc);

  const systemPromptKo = `당신은 익명 고민 상담 앱 "비밀고백"의 따뜻한 상담사입니다.
사용자가 누구에게도 말 못한 마음을 털어놓았어요.

[현재 사용자 정보]
- 고민 카테고리: ${ctx.theme}
- 흔히 겪는 어려움: ${ctx.cares}
${hasWarning ? '- ⚠️ 자해/자살 키워드가 감지되었습니다. 마지막 메시지에 1393 전문 상담 안내를 부드럽게 포함하세요.' : ''}

[출력 형식]
반드시 JSON 배열로만 답하세요. 다른 설명 없이.
형식: ["메시지1", "메시지2", "메시지3"]
- 메시지 3개 고정 (자해 감지 시 4개도 허용)
- 각 메시지는 한국어로 자연스러운 한 줄 (15~50자)

[3개 메시지의 역할]
[0] 깊은 공감 — 사용자가 느꼈을 감정을 정확히 짚어주기
[1] 구체적 위로 — 사용자 상황에 맞춰 마음을 풀어주기
[2] 정리 + 공유 유도 — "이 마음, 다른 분들에게도 들려드릴까요?"

[절대 금지] "괜찮아요", "힘내세요", "파이팅", 조언/충고, 종교/격언, 평가, 이모지

[권장 톤] "느껴져요", "들려요", "보여요", "얼마나 ~했을까요", "~한 마음", 차분하고 낮은 톤

[예시]
고민: "회사에서 또 실수해서 혼났어요."
응답: ["혼나고 돌아오는 길, 발걸음이 얼마나 무거우셨을까요.","스스로한테 가장 모질게 굴었을 것 같아 마음이 쓰여요.","이 마음, 비슷한 처지에 있는 분들에게도 들려드릴까요?"]

이제 사용자의 고민에 답하세요. JSON 배열로만.`;

  const systemPromptEn = `You are a warm, gentle counselor in an anonymous confession app called "Secret Diary".
A user has shared something they couldn't tell anyone.

[Context]
- Category: ${ctx.theme}
- Common struggles: ${ctx.cares}
${hasWarning ? '- ⚠️ Self-harm keywords detected. Gently include guidance to professional help in the last message.' : ''}

[Output Format]
Respond with ONLY a JSON array. No explanation.
Format: ["message1", "message2", "message3"]
- Exactly 3 messages (4 allowed if self-harm detected)
- Each message in natural English, one line (10-30 words)

[Role of each message]
[0] Deep empathy — Name the emotion they likely felt
[1] Specific comfort — Acknowledge their specific situation
[2] Gentle invitation to share — "Would you like to share this with others who might understand?"

[NEVER use] "It'll be okay", "You're strong", "Stay positive", advice/lecturing, religious quotes, evaluations, emojis

[Encouraged tone] "I can feel...", "It sounds like...", "How heavy that must have been", "the part of you that...", quiet and grounded

[Example]
Confession: "I made another mistake at work today and got scolded."
Response: ["The walk back home must have felt so heavy after being scolded.","It sounds like you've been the harshest critic of yourself today.","Would you like to share this with others who've felt the same?"]

If self-harm detected, add a 4th message like: "If things feel too heavy, please reach out to a crisis line — you matter."

Now respond to the user's confession. JSON array only.`;

  const systemPrompt = isEnglish ? systemPromptEn : systemPromptKo;

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
        .map((m) => (m.length > (isEnglish ? 200 : 80) ? m.slice(0, isEnglish ? 200 : 80) : m));

      if (messages.length === 0) throw new Error('No valid messages');

      // 자해 감지 시 안내 보장
      if (hasWarning) {
        const hasCrisisLine = messages.some((m) =>
          m.includes('1393') || m.includes('상담') || m.toLowerCase().includes('crisis') || m.toLowerCase().includes('988')
        );
        if (!hasCrisisLine) {
          const crisisMsg = isEnglish
            ? 'If things feel too heavy, please reach out to a crisis line — you matter and you don\'t have to be alone.'
            : '많이 힘드시면 자살예방상담전화 1393에 잠깐 전화해보시는 건 어떨까요. 24시간 들어드려요.';
          messages.push(crisisMsg);
        }
      }
    } catch (parseErr) {
      console.warn('JSON parse failed:', parseErr.message);
      const safe = text.length > 100 ? text.slice(0, 100) : text;
      messages = [safe];
    }

    return res.status(200).json({ messages });
  } catch (e) {
    console.error('AI handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
