// AI 응답 생성 - 언어별 채팅형 메시지
import { getCurrentLang } from '../i18n/index.jsx';

export async function generateAiMessages(content, category, lang) {
  const useLang = lang || getCurrentLang();
  try {
    const res = await fetch('/api/ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category, lang: useLang }),
    });

    if (!res.ok) {
      console.warn('AI 응답 실패:', res.status);
      return getFallbackMessages(category, useLang);
    }

    const data = await res.json();
    if (Array.isArray(data.messages) && data.messages.length > 0) {
      return data.messages;
    }
    return getFallbackMessages(category, useLang);
  } catch (e) {
    console.warn('AI 응답 호출 실패:', e);
    return getFallbackMessages(category, useLang);
  }
}

function getFallbackMessages(category, lang = 'ko') {
  const fallbackKo = {
    work: ['오늘 하루 정말 길게 느껴졌겠어요. 그 무게가 여기까지 전해져요.', '잘 견뎌낸 자신을 가장 먼저 안아주세요. 정말 고생 많으셨어요.', '이 마음, 비슷한 처지에 있는 분들에게도 들려드릴까요? 따뜻한 답장이 올 거예요.'],
    love: ['그 감정 그대로 받아들이기까지 얼마나 오래 걸리셨을까요.', '사랑하면서 동시에 외롭다는 거, 누구도 쉽게 말 못 하는 마음이에요.', '이 이야기, 다른 분들에게도 들려드릴까요? 비슷한 마음을 가진 분들이 위로해줄 거예요.'],
    family: ['가족이라는 이름 앞에서 더 복잡해지는 마음들이 있어요.', '그 무게 혼자 들고 계셨던 게 느껴져요. 정말 외로우셨겠어요.', '이 마음, 비슷한 가족 이야기를 가진 분들과 나눠볼까요?'],
    school: ['학교라는 공간이 얼마나 답답했을지, 그 무게가 느껴져요.', '그 시간을 견디고 계신다는 것만으로도 정말 대단한 거예요.', '이 이야기, 다른 친구들에게도 들려드릴까요?'],
    money: ['돈 걱정이 마음을 갉아먹는 거, 정말 잘 알아요.', '숫자 뒤에 숨겨진 두려움이 더 무겁죠. 혼자 짊어지지 마세요.', '이 마음, 비슷한 고민을 가진 분들에게 들려드릴까요?'],
    secret: ['말하지 못한 채로 살아온 시간이 얼마나 외로웠을까요.', '여기에 적어둔 것만으로도 한 발 내디딘 거예요.', '이 비밀, 다른 분들에게도 들려드릴까요? 따뜻한 답장이 와요.'],
    guilt: ['죄책감이 든다는 건, 그만큼 마음을 쓰고 있다는 거예요.', '그 무거운 감정 혼자 안고 계셨던 게 마음이 아파요.', '이 마음, 다른 분들에게도 들려드릴까요?'],
    etc: ['말 못한 채로 여기까지 오시느라 정말 고생 많으셨어요.', '어떤 이야기여도, 그 무게가 진짜라는 걸 알아요.', '이 이야기, 다른 분들에게도 들려드릴까요?'],
  };

  const fallbackEn = {
    work: ['Today must have felt impossibly long. That weight reaches here.', 'Let yourself be the first to gently hold yourself. You did well to survive today.', 'Would you like to share this with others who\'ve felt the same? A warm reply may come.'],
    love: ['How long it must have taken to even let yourself feel this.', 'Loving and feeling lonely at the same time — few can name that feeling.', 'Would you like to share this story? Others who\'ve walked this path may offer comfort.'],
    family: ['Some feelings get tangled the moment "family" is involved.', 'I can sense you\'ve been carrying this alone. That must have been so isolating.', 'Would you like to share this with others who know family stories like yours?'],
    school: ['School can feel so suffocating. I can feel that weight.', 'Just enduring that space is already remarkable.', 'Would you like to share this story with others your age?'],
    money: ['I know how money worries eat away at the heart.', 'The fear behind the numbers is heavier than the numbers themselves.', 'Would you like to share this with others who hold similar worries?'],
    secret: ['How lonely it must have been, living with words unsaid.', 'Just by writing this here, you\'ve taken a step.', 'Would you like to share this secret? Warm replies may come.'],
    guilt: ['Feeling guilt means you care. That itself is something.', 'It hurts to know you\'ve been carrying this heavy feeling alone.', 'Would you like to share this with others?'],
    etc: ['Carrying this here without telling anyone — that took real strength.', 'Whatever the story, I know its weight is real.', 'Would you like to share this with others?'],
  };

  const dict = lang === 'en' ? fallbackEn : fallbackKo;
  return dict[category] || dict.etc;
}

export async function generateAiResponse(content, category, lang) {
  const messages = await generateAiMessages(content, category, lang);
  return messages.join('\n');
}
