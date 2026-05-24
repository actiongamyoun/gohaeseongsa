import { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import WriteScreen from './screens/WriteScreen.jsx';
import AiResponseScreen from './screens/AiResponseScreen.jsx';
import DetailScreen from './screens/DetailScreen.jsx';
import AdminScreen from './screens/AdminScreen.jsx';
import MyScreen from './screens/MyScreen.jsx';
import { getRandomBackground } from './lib/backgrounds.js';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detailData, setDetailData] = useState(null);
  const [confessionDraft, setConfessionDraft] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bgImage, setBgImage] = useState(getRandomBackground);
  const [bgLoaded, setBgLoaded] = useState(false);

  // 배경 이미지 로드 확인
  useEffect(() => {
    if (!bgImage) return;
    const img = new Image();
    img.onload = () => {
      setBgLoaded(true);
      console.log('[bg] 배경 로드 성공:', bgImage);
    };
    img.onerror = () => {
      console.warn('[bg] 배경 로드 실패:', bgImage, '— public/backgrounds/ 폴더에 이미지가 있는지 확인하세요');
      setBgLoaded(false);
    };
    img.src = bgImage;
  }, [bgImage]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/app') setScreen('home');
    else if (path === '/admin') setScreen('admin');
    else if (path === '/my') setScreen('my');
    else setScreen('landing');

    const handlePop = () => {
      const p = window.location.pathname;
      if (p === '/app') setScreen('home');
      else if (p === '/admin') setScreen('admin');
      else if (p === '/my') setScreen('my');
      else setScreen('landing');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  function navigate(target, data) {
    if (target === 'landing') window.history.pushState({}, '', '/');
    else if (target === 'home') window.history.pushState({}, '', '/app');
    else if (target === 'admin') window.history.pushState({}, '', '/admin');
    else if (target === 'my') window.history.pushState({}, '', '/my');
    else if (target === 'detail') window.history.pushState({}, '', '/detail');
    else if (target === 'write') window.history.pushState({}, '', '/write');
    else if (target === 'ai-response') window.history.pushState({}, '', '/listening');

    if (data !== undefined) setDetailData(data);
    setScreen(target);
  }

  return (
    <div
      className={`app-frame ${bgLoaded ? 'has-bg-image' : 'has-bg-fallback'}`}
      style={bgLoaded ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="app-bg-overlay" />
      <AmbientParticles />

      {screen === 'landing' && (
        <LandingScreen
          onEnter={() => navigate('home')}
          onAdmin={() => navigate('admin')}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          key={refreshKey}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onBack={() => navigate('landing')}
          onWrite={() => navigate('write')}
          onOpenDetail={(c) => navigate('detail', c)}
          onMyPage={() => navigate('my')}
        />
      )}

      {screen === 'write' && (
        <WriteScreen
          onClose={() => navigate('home')}
          onListen={(draft) => {
            setConfessionDraft(draft);
            navigate('ai-response');
          }}
        />
      )}

      {screen === 'ai-response' && confessionDraft && (
        <AiResponseScreen
          confessionDraft={confessionDraft}
          onShared={(saved) => {
            setConfessionDraft(null);
            setRefreshKey((k) => k + 1);
            if (saved) navigate('detail', saved);
            else navigate('home');
          }}
          onDiscarded={() => {
            setConfessionDraft(null);
            navigate('home');
          }}
          onBack={() => {
            setConfessionDraft(null);
            navigate('write');
          }}
        />
      )}

      {screen === 'detail' && (
        <DetailScreen
          confessionId={detailData?.id}
          demoData={detailData?.id?.startsWith?.('demo-') ? detailData : null}
          onClose={() => navigate('home')}
        />
      )}

      {screen === 'my' && (
        <MyScreen
          onClose={() => navigate('home')}
          onOpenDetail={(c) => navigate('detail', c)}
        />
      )}

      {screen === 'admin' && (
        <AdminScreen onClose={() => navigate('landing')} />
      )}
    </div>
  );
}

// 떠다니는 작은 점들 (배경 효과)
function AmbientParticles() {
  const particles = [
    { x: 10, y: 15, dur: 6, delay: 0 },
    { x: 80, y: 25, dur: 8, delay: 1.5 },
    { x: 30, y: 50, dur: 7, delay: 3 },
    { x: 65, y: 60, dur: 9, delay: 0.5 },
    { x: 20, y: 80, dur: 6.5, delay: 2 },
    { x: 90, y: 75, dur: 7.5, delay: 4 },
    { x: 50, y: 30, dur: 8.5, delay: 2.5 },
    { x: 75, y: 90, dur: 6, delay: 5 },
  ];

  return (
    <div className="ambient-particles" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="ambient-dot"
          style={{
            '--x': `${p.x}%`,
            '--y': `${p.y}%`,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
