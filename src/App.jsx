import { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import WriteScreen from './screens/WriteScreen.jsx';
import DetailScreen from './screens/DetailScreen.jsx';
import AdminScreen from './screens/AdminScreen.jsx';

export default function App() {
  // 'landing' | 'home' | 'write' | 'detail' | 'admin'
  const [screen, setScreen] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detailData, setDetailData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // URL 기반 초기 라우팅
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/app') setScreen('home');
    else if (path === '/admin') setScreen('admin');
    else setScreen('landing');

    const handlePop = () => {
      const p = window.location.pathname;
      if (p === '/app') setScreen('home');
      else if (p === '/admin') setScreen('admin');
      else setScreen('landing');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  function navigate(target, data) {
    if (target === 'landing') window.history.pushState({}, '', '/');
    else if (target === 'home') window.history.pushState({}, '', '/app');
    else if (target === 'admin') window.history.pushState({}, '', '/admin');
    else if (target === 'detail') window.history.pushState({}, '', '/detail');
    else if (target === 'write') window.history.pushState({}, '', '/write');

    if (data !== undefined) setDetailData(data);
    setScreen(target);
  }

  return (
    <div className="app-frame">
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
        />
      )}

      {screen === 'write' && (
        <WriteScreen
          onClose={() => navigate('home')}
          onSubmitted={(c) => {
            setRefreshKey((k) => k + 1);
            if (c) navigate('detail', c);
            else navigate('home');
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

      {screen === 'admin' && (
        <AdminScreen onClose={() => navigate('landing')} />
      )}
    </div>
  );
}
