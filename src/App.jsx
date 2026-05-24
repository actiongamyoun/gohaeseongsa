import { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import WriteScreen from './screens/WriteScreen.jsx';
import AiResponseScreen from './screens/AiResponseScreen.jsx';
import DetailScreen from './screens/DetailScreen.jsx';
import AdminScreen from './screens/AdminScreen.jsx';
import MyScreen from './screens/MyScreen.jsx';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detailData, setDetailData] = useState(null);
  const [confessionDraft, setConfessionDraft] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
