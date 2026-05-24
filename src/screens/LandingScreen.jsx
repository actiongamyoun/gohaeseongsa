import { CATEGORIES } from '../lib/constants.js';
import { CATEGORY_ICONS, IconLock, IconHeart, IconCandle, IconCheer } from '../components/icons.jsx';

export default function LandingScreen({ onEnter, onAdmin }) {
  return (
    <div className="landing-scroll">

      {/* ===== Hero ===== */}
      <section className="landing-hero">
        <div className="hero-brand-script">Secret Diary</div>
        <h1 className="hero-title">비밀고백</h1>
        <p className="hero-tagline">익명의 당신께,<br />따뜻한 답장을</p>
        <p className="hero-sub">
          누구에게도 말 못한 마음,<br />
          다 들어드릴게요
        </p>

        <button className="hero-cta" onClick={onEnter}>
          마음 적어보기
        </button>
        <div className="hero-cta-sub">가입도, 로그인도 필요 없어요</div>
        <div className="hero-manifesto">
          타인에게 상처 입히는 말은 자제하는<br />
          <strong>성숙한 사람들의 공간</strong>입니다
        </div>
      </section>

      {/* ===== 카테고리 ===== */}
      <section className="landing-section">
        <div className="section-script">categories</div>
        <h2 className="section-title">어떤 이야기든 괜찮아요</h2>

        <div className="category-showcase">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.key];
            return (
              <div key={cat.key} className="cat-showcase-item">
                {Icon && <div className="cat-showcase-icon"><Icon /></div>}
                <span className="cat-showcase-label">{cat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 약속 ===== */}
      <section className="landing-section landing-section-cream">
        <div className="section-script">our promise</div>
        <h2 className="section-title">우리의 약속</h2>

        <div className="promises">
          <div className="promise">
            <div className="promise-icon"><IconLock /></div>
            <div>
              <div className="promise-title">완전한 익명</div>
              <div className="promise-desc">이름도, 이메일도, 계정도 받지 않아요</div>
            </div>
          </div>
          <div className="promise">
            <div className="promise-icon"><IconHeart /></div>
            <div>
              <div className="promise-title">먼저 들어드림</div>
              <div className="promise-desc">공유 전에 AI가 따뜻한 답장을 먼저 보내드려요</div>
            </div>
          </div>
          <div className="promise">
            <div className="promise-icon"><IconCheer /></div>
            <div>
              <div className="promise-title">공유는 선택</div>
              <div className="promise-desc">공유하기 싫으면 저장 없이 깔끔하게 닫혀요</div>
            </div>
          </div>
          <div className="promise">
            <div className="promise-icon"><IconCandle /></div>
            <div>
              <div className="promise-title">힘들 때 안내</div>
              <div className="promise-desc">자해/자살 키워드 감지 시 전문 상담으로 안내해요</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="landing-final">
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
          <strong>알아두세요</strong>
          <p>
            비밀고백의 AI 답장은 참고용 자동 응답이며,<br />
            전문 심리상담을 대체하지 않습니다.<br />
            전문가의 도움이 필요하시면 아래로 연락해주세요.
          </p>
          <div className="footer-helplines">
            <a href="tel:1393" className="helpline">자살예방상담 1393</a>
            <a href="tel:1388" className="helpline">청소년상담 1388</a>
            <a href="tel:1577-0199" className="helpline">정신건강위기상담 1577-0199</a>
          </div>
        </div>
        <div className="footer-copy">
          © 2026 비밀고백 · Secret Diary
          {onAdmin && <span className="admin-dot" onClick={onAdmin}>·</span>}
        </div>
      </footer>

    </div>
  );
}
