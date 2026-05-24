// AI 응답 생성 - 채팅형 여러 메시지

export async function generateAiMessages(content, category) {
  try {
    const res = await fetch('/api/ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category }),
    });

    if (!res.ok) {
      console.warn('AI 응답 실패:', res.status);
      return getFallbackMessages(category);
    }

    const data = await res.json();
    if (Array.isArray(data.messages) && data.messages.length > 0) {
      return data.messages;
    }
    return getFallbackMessages(category);
  } catch (e) {
    console.warn('AI 응답 호출 실패:', e);
    return getFallbackMessages(category);
  }
}

// AI 실패 시 카테고리별 fallback - 공유 유도 메시지 포함
function getFallbackMessages(category) {
  const fallback = {
    work: [
      '오늘 하루 정말 길게 느껴졌겠어요. 그 무게가 여기까지 전해져요.',
      '잘 견뎌낸 자신을 가장 먼저 안아주세요. 정말 고생 많으셨어요.',
      '이 마음, 비슷한 처지에 있는 분들에게도 들려드릴까요? 따뜻한 답장이 올 거예요.',
    ],
    love: [
      '그 감정 그대로 받아들이기까지 얼마나 오래 걸리셨을까요.',
      '사랑하면서 동시에 외롭다는 거, 누구도 쉽게 말 못 하는 마음이에요.',
      '이 이야기, 다른 분들에게도 들려드릴까요? 비슷한 마음을 가진 분들이 위로해줄 거예요.',
    ],
    family: [
      '가족이라는 이름 앞에서 더 복잡해지는 마음들이 있어요.',
      '그 무게 혼자 들고 계셨던 게 느껴져요. 정말 외로우셨겠어요.',
      '이 마음, 비슷한 가족 이야기를 가진 분들과 나눠볼까요? 따뜻한 답장이 와요.',
    ],
    school: [
      '학교라는 공간이 얼마나 답답했을지, 그 무게가 느껴져요.',
      '그 시간을 견디고 계신다는 것만으로도 정말 대단한 거예요.',
      '이 이야기, 다른 친구들에게도 들려드릴까요? 같은 마음의 답장이 올 거예요.',
    ],
    money: [
      '돈 걱정이 마음을 갉아먹는 거, 정말 잘 알아요.',
      '숫자 뒤에 숨겨진 두려움이 더 무겁죠. 혼자 짊어지지 마세요.',
      '이 마음, 비슷한 고민을 가진 분들에게 들려드릴까요? 위로받아볼 수 있어요.',
    ],
    secret: [
      '말하지 못한 채로 살아온 시간이 얼마나 외로웠을까요.',
      '여기에 적어둔 것만으로도 한 발 내디딘 거예요. 정말 용기 내셨어요.',
      '이 비밀, 다른 분들에게도 들려드릴까요? 비슷한 짐을 진 분들이 따뜻하게 안아줄 거예요.',
    ],
    guilt: [
      '죄책감이 든다는 건, 그만큼 마음을 쓰고 있다는 거예요.',
      '그 무거운 감정 혼자 안고 계셨던 게 마음이 아파요.',
      '이 마음, 다른 분들에게도 들려드릴까요? 비슷한 후회를 가진 분들과 위로받아요.',
    ],
    etc: [
      '말 못한 채로 여기까지 오시느라 정말 고생 많으셨어요.',
      '어떤 이야기여도, 그 무게가 진짜라는 걸 알아요.',
      '이 이야기, 다른 분들에게도 들려드릴까요? 따뜻한 답장이 와요.',
    ],
  };

  return fallback[category] || fallback.etc;
}

// 구버전 호환용
export async function generateAiResponse(content, category) {
  const messages = await generateAiMessages(content, category);
  return messages.join('\n');
}
