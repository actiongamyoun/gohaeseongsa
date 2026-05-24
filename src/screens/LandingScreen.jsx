import { CATEGORIES } from '../lib/constants.js';

const SAMPLE_CONFESSIONS = [
  {
    category: 'work',
    content: '회사 화장실에서 운 적이 다섯 번 넘는다. 다들 잘 사는 것 같은데 나만 무너지는 것 같다.',
    ai: '잘 사는 것처럼 보이는 사람들도 다들 어딘가에서 울고 있어요.',
  },
  {
    category: 'love',
    content: '5년 만난 사람이랑 헤어졌는데, 헤어지자고 한 게 나라서 슬퍼할 자격도 없는 것 같다.',
    ai: '결정한 사람도 똑같이 아파요. 자격 같은 거 따지지 마세요.',
  },
  {
    category: 'family',
    content: '엄마 생일 까먹었다. 이미 3일 지났는데 아직도 말 못함.',
    ai: '지금이라도 전화해요. 늦은 효도는 있어도 안 한 효도는 없잖아요.',
  },
];

export default function LandingScreen({ onEnter, onAdmin }) {
  return (
    <div className="landing-scroll">

      {/* ===== Hero ===== */}
      <section className="landing-hero">
        <div className="hero-decor-top">🕯️</div>
        <div className="hero-brand-script">Secret Confession</div>
        <h1 className="hero-title">비밀고백</h1>
        <p className="hero-tagline">익명의 당신께,<br />따뜻한 답장을</p>
        <p className="hero-sub">
          누구에게도 말 못한 마음,<br />
          AI가 먼저 들어드리고<br />
          비슷한 마음의 사람들이 답장을 남겨드려요
        </p>

        <button className="hero-cta" onClick={onEnter}>
          마음 적어보기
        </button>
        <div className="hero-cta-sub">— 가입도, 로그인도 필요 없어요 —</div>
      </section>

      {/* ===== 어떻게 흘러가나요 ===== */}
      <section className="landing-section">
        <div className="section-script">how it works</div>
        <h2 className="section-title">이렇게 흘러가요</h2>

        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-emoji">✍️</div>
            <div className="step-title">조용히 적어두기</div>
            <div className="step-desc">
              누구에게도 말 못한 이야기를<br />
              완전 익명으로 적어주세요
            </div>
          </div>

          <div className="step">
            <div className="step-num">02</div>
            <div className="step-emoji">💌</div>
            <div className="step-title">AI가 먼저 들어드려요</div>
            <div className="step-desc">
              따뜻한 한 줄 답장을<br />
              조심스럽게 보내드려요
            </div>
          </div>

          <div className="step">
            <div className="step-num">03</div>
            <div className="step-emoji">🤝</div>
            <div className="step-title">공유는 선택이에요</div>
            <div className="step-desc">
              마음이 진정된 다음<br />
              다른 분께 들려드릴지 정해요
            </div>
          </div>

          <div className="step">
            <div className="step-num">04</div>
            <div className="step-emoji">🫂</div>
            <div className="step-title">함께 위로받기</div>
            <div className="step-desc">
              비슷한 마음의 사람들이<br />
              조용히 답장을 남겨줘요
            </div>
          </div>
        </div>
      </section>

      {/* ===== 샘플 ===== */}
      <section className="landing-section landing-section-cream">
        <div className="section-script">today's letters</div>
        <h2 className="section-title">오늘의 답장들</h2>
        <p className="section-sub">지금 이 순간에도 누군가 마음을 적고, 답장을 받고 있어요</p>

        <div className="sample-feed">
          {SAMPLE_CONFESSIONS.map((c, i) => {
            const cat = CATEGORIES.find((x) => x.key === c.category);
            return (
              <div key={i} className="sample-card">
                <div className="sample-cat">{cat.emoji} {cat.label}</div>
                <div className="sample-content">{c.content}</div>
                <div className="sample-ai">
                  <span className="sample-ai-label">💌 from Claude</span>
                  {c.ai}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 카테고리 ===== */}
      <section className="landing-section">
        <div className="section-script">categories</div>
        <h2 className="section-title">어떤 이야기든 괜찮아요</h2>

        <div className="category-showcase">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="cat-showcase-item">
              <span className="cat-showcase-emoji">{cat.emoji}</span>
              <span className="cat-showcase-label">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 약속 ===== */}
      <section className="landing-section landing-section-cream">
        <div className="section-script">our promise</div>
        <h2 className="section-title">우리의 약속</h2>

        <div className="promises">
          <div className="promise">
            <span className="promise-icon">🔒</span>
            <div>
              <div className="promise-title">완전한 익명</div>
              <div className="promise-desc">이름도, 이메일도, 계정도 받지 않아요</div>
            </div>
          </div>
          <div className="promise">
            <span className="promise-icon">💌</span>
            <div>
              <div className="promise-title">먼저 들어드림</div>
              <div className="promise-desc">공유 전에 AI가 따뜻한 답장을 먼저 보내드려요</div>
            </div>
          </div>
          <div className="promise">
            <span className="promise-icon">🤝</span>
            <div>
              <div className="promise-title">공유는 선택</div>
              <div className="promise-desc">공유하기 싫으면 저장 없이 깔끔하게 닫혀요</div>
            </div>
          </div>
          <div className="promise">
            <span className="promise-icon">🕯️</span>
            <div>
              <div className="promise-title">힘들 때 안내</div>
              <div className="promise-desc">자해/자살 키워드 감지 시 전문 상담으로 안내해요</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="landing-final">
        <div className="final-decor">✉</div>
        <h2 className="final-title">
          오늘 마음,<br />어디에 두실래요?
        </h2>
        <p className="final-sub">
          여기에 적어두세요.<br />
          조용히 들어드릴게요.
        </p>
        <button className="hero-cta hero-cta-final" onClick={onEnter}>
          마음 적어보기 →
        </button>
      </section>

      {/* ===== Footer ===== */}
      <footer className="landing-footer">
        <div className="footer-disclaimer">
          <strong>📌 알아두세요</strong>
          <p>
            비밀고백의 AI 답장은 참고용 자동 응답이며,<br />
            전문 심리상담을 대체하지 않습니다.<br />
            전문가의 도움이 필요하시면 아래로 연락해주세요.
          </p>
          <div className="footer-helplines">
            <a href="tel:1393" className="helpline">📞 자살예방상담 1393</a>
            <a href="tel:1388" className="helpline">📞 청소년상담 1388</a>
            <a href="tel:1577-0199" className="helpline">📞 정신건강위기상담 1577-0199</a>
          </div>
        </div>
        <div className="footer-copy">
          © 2026 비밀고백 · Secret Confession
          {onAdmin && <span className="admin-dot" onClick={onAdmin}>·</span>}
        </div>
      </footer>

    </div>
  );
}
