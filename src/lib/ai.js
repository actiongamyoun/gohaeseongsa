// AI 응답 생성 (Vercel Serverless Function 호출)
// 채팅형 - 여러 메시지 배열을 반환

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

// AI 실패 시 카테고리별 fallback 메시지
function getFallbackMessages(category) {
  const fallback = {
    work: [
      '오늘 하루도 정말 길게 느껴졌겠어요.',
      '잘 견뎌낸 자신을 가장 먼저 안아주세요.',
      '여기서 잠깐 숨 좀 내려놓고 가세요.',
    ],
    love: [
      '그 감정 그대로 받아들이기까지 얼마나 오래 걸리셨을까요.',
      '사랑하면서 동시에 외롭다는 거, 누구도 쉽게 못 말해요.',
      '천천히 더 말해주세요. 듣고 있어요.',
    ],
    family: [
      '가족이라는 이름 앞에서 더 복잡해지는 마음들이 있어요.',
      '그 무게 혼자 들고 있었던 게 느껴져요.',
      '오늘은 여기에 좀 내려놔도 괜찮아요.',
    ],
    school: [
      '학교라는 공간이 얼마나 무거웠을지 느껴져요.',
      '그 시간을 견디고 있다는 것만으로도 충분해요.',
      '여기는 채점 안 해요. 편하게 말해주세요.',
    ],
    money: [
      '돈 걱정이 마음을 갉아먹는 거, 정말 잘 알아요.',
      '숫자 뒤에 숨겨진 두려움이 더 무겁죠.',
      '잠깐만이라도 그 무게 내려놓고 쉬어주세요.',
    ],
    secret: [
      '말하지 못한 채로 살아온 시간이 얼마나 외로웠을까요.',
      '여기에 적어둔 것만으로도 한 발 내디딘 거예요.',
      '비밀은 여기 두고 가셔도 돼요.',
    ],
    guilt: [
      '죄책감이 든다는 건, 그만큼 마음을 쓰고 있다는 거예요.',
      '그 무거운 감정 혼자 안고 있지 마세요.',
      '여기서는 판단받지 않아요. 더 말해주세요.',
    ],
    etc: [
      '말 못한 채로 여기까지 오시느라 고생 많으셨어요.',
      '어떤 이야기여도 다 들어드릴 수 있어요.',
      '천천히, 편하게 말해주세요.',
    ],
  };

  return fallback[category] || fallback.etc;
}

// 구버전 호환용
export async function generateAiResponse(content, category) {
  const messages = await generateAiMessages(content, category);
  return messages.join(' ');
}
