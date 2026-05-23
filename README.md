# 🕯️ 비밀고백 (Secret Confession)

> **익명의 당신, 익명의 위로**

따뜻한 일기장 무드의 익명 고백 PWA. 누구에게도 말 못할 이야기를 익명으로 적어두고, 같은 마음의 사람들에게 댓글로 위로받는 공간.

> ⚠️ Repo 이름은 `gohaeseongsa`이지만 서비스명은 **비밀고백**으로 진행 중입니다.

## 🎨 컨셉

- **무드**: 베이지/크림색 비밀일기장
- **타겟**: 누구에게도 말 못할 이야기를 가볍게 털어놓고 싶은 사람
- **핵심 가치**: 익명 + 군중의 공감 (AI는 부가 기능)

## 🛠️ 기술 스택

- **Frontend**: Vite + React 18
- **Backend**: Supabase (Seoul region)
- **AI**: Anthropic Claude API (via Vercel Serverless Functions)
- **Deploy**: Vercel
- **PWA**: Service Worker + Manifest

## 📁 폴더 구조

```
gohaeseongsa/
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
│   │   └── time.js
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── CategoryTabs.jsx
│   │   └── ConfessionCard.jsx
│   ├── screens/
│   │   ├── LandingScreen.jsx    ← NEW
│   │   └── HomeScreen.jsx
│   ├── styles/
│   │   ├── global.css
│   │   └── landing.css          ← NEW
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## 🗺️ 라우팅

- `/` → 랜딩페이지 (매번 노출)
- `/app` → 홈 화면 (고백 피드)

## 🚀 로컬 개발

```bash
npm install
cp .env.example .env.local  # Supabase 키 입력
npm run dev
```

## ☁️ Vercel 배포

1. GitHub repo에 푸시
2. Vercel → New Project → repo 선택
3. Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## 📌 면책조항

비밀고백의 AI 응답은 참고용 자동 답변이며, 전문 심리상담을 대체하지 않습니다.

- 자살예방상담: **1393**
- 청소년상담: **1388**
- 정신건강위기상담: **1577-0199**

## 📊 진행 단계

- [x] 1단계: Supabase 스키마
- [x] 2단계: 초기 구조 + 홈 화면
- [x] **추가: 랜딩페이지 + 브랜드 리뉴얼 (고해성사 → 비밀고백)**
- [ ] 3단계: 고백 작성 화면
- [ ] 4단계: AI 응답 (Vercel Serverless)
- [ ] 5단계: 상세 + 감정 버튼 + 댓글
- [ ] 6단계: 자해 감지 + 욕설 필터 + 신고
- [ ] 7단계: 관리자 페이지
- [ ] 8단계: PWA 마무리

## 📝 License

Private project.
