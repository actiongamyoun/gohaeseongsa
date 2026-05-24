# 🕯️ 비밀고백 (Secret Confession)

> **익명의 당신께, 따뜻한 답장을**

고민상담/위로 중심의 익명 PWA. 누구에게도 말 못할 마음을 적으면, **AI가 먼저 따뜻한 답장을 보내드리고**, 마음이 진정된 다음 다른 분들에게 공유할지 다시 여쭤봅니다.

> ⚠️ Repo 이름은 `gohaeseongsa`이지만 서비스명은 **비밀고백**입니다.

## 🔄 핵심 흐름

```
1. 마음 적기
2. "들어주세요" 버튼
3. AI가 3~5초간 답장 작성 중 (랜덤 연출)
4. AI 답장 등장 (편지봉투 / 펼치기 / 촛불 / 꽃잎 / 별 5종 랜덤)
5. "다른 분들께도 들려드릴까요?" 결정
   ├─ 네 → 공개 게시 → 익명 댓글로 추가 위로 받기
   └─ 아니요 → 저장 없이 종료
```

## 🛠️ 기술 스택

- **Frontend**: Vite + React 18
- **Backend**: Supabase (Seoul region)
- **AI**: Anthropic Claude API via Vercel Serverless
- **Deploy**: Vercel
- **PWA**: Service Worker + Manifest

## 📁 구조

```
gohaeseongsa/
├── api/
│   └── ai-response.js          # Vercel Serverless
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── session.js
│   │   ├── constants.js
│   │   ├── safetyCheck.js
│   │   ├── time.js
│   │   └── ai.js
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── CategoryTabs.jsx
│   │   └── ConfessionCard.jsx
│   ├── screens/
│   │   ├── LandingScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── WriteScreen.jsx          # 비공개 토글 제거됨
│   │   ├── AiResponseScreen.jsx     # 🆕 AI 답장 + 결정
│   │   ├── DetailScreen.jsx
│   │   └── AdminScreen.jsx
│   ├── styles/
│   │   ├── global.css
│   │   └── landing.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── README.md
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## 🗺️ 라우팅

| 경로 | 화면 |
|---|---|
| `/` | 랜딩 |
| `/app` | 홈 피드 |
| `/write` | 마음 적기 |
| `/listening` | 🆕 AI 답장 + 결정 |
| `/detail` | 상세 + 댓글 |
| `/admin` | 관리자 (admin0000) |

## 🎨 AI 답장 등장 연출 (랜덤 5종)

1. **envelope** — 봉투가 위에서 살랑 → 봉인 풀림 → 편지 펼쳐짐
2. **paper-fold** — 접힌 편지지가 펼쳐지며 답장 노출
3. **candle** — 배경에 깜빡이는 큰 촛불 + 단순 카드
4. **petals** — 꽃잎이 떨어지는 배경 + 단순 카드
5. **star-shower** — 별이 반짝이는 배경 + 단순 카드

답장 텍스트는 **타자기 효과**로 한 글자씩 나타납니다.

## 🚀 로컬 개발

```bash
npm install
cp .env.example .env.local
npm run dev
```

## ☁️ Vercel 환경변수 (3개 필수)

| 키 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `ANTHROPIC_API_KEY` | Claude API 키 (sk-ant-...) |

## 🛡️ 안전장치

- ✅ 자해 키워드 → 1393/1388 안내
- ✅ 욕설 → 확인 다이얼로그
- ✅ 신상정보 → 차단
- ✅ AI 답장 실패 시 fallback 메시지
- ✅ "아니요" 선택 시 저장 안 함
- ✅ 신고 시스템
- ✅ 관리자 숨김/삭제

## 📌 면책조항

비밀고백의 AI 답장은 참고용 자동 응답이며, 전문 심리상담을 대체하지 않습니다.

- 자살예방상담: **1393**
- 청소년상담: **1388**
- 정신건강위기상담: **1577-0199**

## 📊 진행 상황

- [x] 1단계: Supabase 스키마
- [x] 2단계: 초기 구조 + 홈
- [x] 추가: 랜딩 + 브랜드 리뉴얼
- [x] 3단계: 작성 + 자해 감지
- [x] 4단계: AI 응답 (Claude API)
- [x] 5단계: 상세 + 댓글 + 감정 버튼
- [x] 6단계: 욕설 필터 + 신고
- [x] 7단계: 관리자 페이지
- [x] 8단계: PWA 마무리
- [x] **🆕 컨셉 전환: 고민상담/위로 + AI 우선 답장 + 공유 선택**

## 📝 License

Private project.
