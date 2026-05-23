import { CATEGORIES } from '../lib/constants.js';

// 랜딩에서 보여줄 샘플 고백 (눈에 띄는 것들)
const SAMPLE_CONFESSIONS = [
  {
    category: 'work',
    content: '회사 화장실에서 운 적이 다섯 번 넘는다. 다들 잘 사는 것 같은데 나만 무너지는 것 같다.',
    reactions: { hug: 1234, me_too: 892 },
  },
  {
    category: 'love',
    content: '5년 만난 사람이랑 헤어졌는데, 헤어지자고 한 게 나라서 슬퍼할 자격도 없는 것 같다.',
    reactions: { hug: 567, bless: 234 },
  },
  {
    category: 'family',
    content: '엄마 생일 까먹었다. 이미 3일 지났는데 아직도 말 못함.',
    reactions: { me_too: 234, bless: 567 },
  },
];

export default function LandingScreen({ onEnter, onAdmin }) {
  return (
    <div className="landing-scroll">

      {/* ===== Hero ===== */}
      <section className="landing-hero">
        <div className="hero-decor-top">✿</div>
        <div className="hero-brand-script">Secret Confession</div>
        <h1 className="hero-title">비밀고백</h1>
        <p className="hero-tagline">익명의 당신,<br />익명의 위로</p>
        <p className="hero-sub">
          혼자 담아두기 힘든 이야기,<br />
          조용히 적어두고 같은 마음의 사람들에게<br />
          따뜻한 답장을 받는 공간
        </p>

        <button className="hero-cta" onClick={onEnter}>
          비밀고백 시작하기
        </button>
        <div className="hero-cta-sub">— 가입도, 로그인도 필요 없어요 —</div>
      </section>

      {/* ===== 어떻게 작동하나요 ===== */}
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
              완전 익명으로 남겨두세요
            </div>
          </div>

          <div className="step">
            <div className="step-num">02</div>
            <div className="step-emoji">💬</div>
            <div className="step-title">같은 마음의 답장</div>
            <div className="step-desc">
              비슷한 시간을 보낸 사람들이<br />
              조용히 위로를 남겨줘요
            </div>
          </div>

          <div className="step">
            <div className="step-num">03</div>
            <div className="step-emoji">🫂</div>
            <div className="step-title">혼자가 아니라는 것</div>
            <div className="step-desc">
              공감, 웃긴다, 필자도임…<br />
              누군가 함께한다는 신호를 받아요
            </div>
          </div>
        </div>
      </section>

      {/* ===== 샘플 고백 ===== */}
      <section className="landing-section landing-section-cream">
        <div className="section-script">today's whispers</div>
        <h2 className="section-title">오늘의 비밀들</h2>
        <p className="section-sub">지금 이 순간에도 누군가 이런 마음을 적어두고 있어요</p>

        <div className="sample-feed">
          {SAMPLE_CONFESSIONS.map((c, i) => {
            const cat = CATEGORIES.find((x) => x.key === c.category);
            return (
              <div key={i} className="sample-card">
                <div className="sample-cat">{cat.emoji} {cat.label}</div>
                <div className="sample-content">{c.content}</div>
                <div className="sample-reactions">
                  {c.reactions.hug && <span>🫂 {c.reactions.hug}</span>}
                  {c.reactions.me_too && <span>🙋 {c.reactions.me_too}</span>}
                  {c.reactions.bless && <span>🙏 {c.reactions.bless}</span>}
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
            <span className="promise-icon">🌷</span>
            <div>
              <div className="promise-title">따뜻한 분위기</div>
              <div className="promise-desc">악성 댓글은 신고 즉시 검토하고 삭제해요</div>
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
          지금,<br />조용히 두고 가세요
        </h2>
        <p className="final-sub">
          누군가는 당신의 이야기를 듣고<br />
          비슷한 마음으로 답장을 남길 거예요
        </p>
        <button className="hero-cta hero-cta-final" onClick={onEnter}>
          시작하기 →
        </button>
      </section>

      {/* ===== Footer ===== */}
      <footer className="landing-footer">
        <div className="footer-disclaimer">
          <strong>📌 알아두세요</strong>
          <p>
            비밀고백의 AI 응답은 참고용 자동 답변이며,<br />
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
