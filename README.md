# 🕯️ 비밀고백 (Secret Confession)

> **익명의 당신, 익명의 위로**

따뜻한 일기장 무드의 익명 고백 PWA. 누구에게도 말 못할 이야기를 익명으로 적어두고, 같은 마음의 사람들에게 댓글로 위로받는 공간.

> ⚠️ Repo 이름은 `gohaeseongsa`이지만 서비스명은 **비밀고백**입니다.

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
│   └── ai-response.js          # Vercel Serverless (Claude API)
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── session.js          # 익명 세션 ID
│   │   ├── constants.js        # 카테고리/감정
│   │   ├── safetyCheck.js      # 자해/욕설/신상정보
│   │   ├── time.js             # 시간 포맷
│   │   └── ai.js               # AI 응답 호출
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── CategoryTabs.jsx
│   │   └── ConfessionCard.jsx
│   ├── screens/
│   │   ├── LandingScreen.jsx   # 랜딩
│   │   ├── HomeScreen.jsx      # 홈 피드
│   │   ├── WriteScreen.jsx     # 고백 작성
│   │   ├── DetailScreen.jsx    # 상세 + 댓글
│   │   └── AdminScreen.jsx     # 관리자
│   ├── styles/
│   │   ├── global.css
│   │   └── landing.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## 🗺️ 라우팅

| 경로 | 화면 |
|---|---|
| `/` | 랜딩페이지 |
| `/app` | 홈 피드 |
| `/write` | 고백 작성 |
| `/detail` | 고백 상세 + 댓글 |
| `/admin` | 관리자 페이지 (비밀번호: `admin0000`) |

## 🚀 로컬 개발

```bash
npm install
cp .env.example .env.local  # 실제 키 입력
npm run dev
```

## ☁️ Vercel 환경변수 (필수 3개)

| 키 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `ANTHROPIC_API_KEY` | Claude API 키 (sk-ant-...) |

⚠️ `ANTHROPIC_API_KEY`는 `VITE_` 접두사 없음 (서버에서만 사용)

## 🔑 관리자 진입

- URL: `/admin` 직접 접속
- 또는 랜딩페이지 푸터 끝의 "·" 점 클릭
- 비밀번호: `admin0000`

## 🛡️ 안전장치

- ✅ 자해 키워드 감지 → 1393/1388 따뜻한 안내 배너
- ✅ 욕설 감지 → 확인 다이얼로그
- ✅ 신상정보 (전화/이메일) → 작성 차단
- ✅ 신고 시스템 (7가지 사유)
- ✅ 관리자 숨김/삭제 기능
- ✅ 세션 ID 기반 중복 반응 방지

## 📌 면책조항

비밀고백의 AI 응답은 참고용 자동 답변이며, 전문 심리상담을 대체하지 않습니다.

- 자살예방상담: **1393**
- 청소년상담: **1388**
- 정신건강위기상담: **1577-0199**

## 📊 진행 단계

- [x] 1단계: Supabase 스키마
- [x] 2단계: 초기 구조 + 홈
- [x] 추가: 랜딩 + 브랜드 리뉴얼
- [x] **3단계: 고백 작성 + 자해 감지**
- [x] **4단계: AI 응답 (Claude API)**
- [x] **5단계: 상세 + 댓글 + 감정 버튼**
- [x] **6단계: 욕설 필터 + 신고**
- [x] **7단계: 관리자 페이지**
- [x] **8단계: PWA 마무리**

## 📝 License

Private project.
