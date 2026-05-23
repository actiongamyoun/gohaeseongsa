import { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';

export default function App() {
  // 화면 라우팅: 'landing' | 'home'
  const [screen, setScreen] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 브라우저 뒤로가기 대응
  useEffect(() => {
    const handlePop = () => {
      // 홈에서 뒤로가기 → 랜딩
      setScreen('landing');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  function goToHome() {
    window.history.pushState({}, '', '/app');
    setScreen('home');
  }

  function goToLanding() {
    window.history.pushState({}, '', '/');
    setScreen('landing');
  }

  return (
    <div className="app-frame">
      {screen === 'landing' ? (
        <LandingScreen onEnter={goToHome} />
      ) : (
        <HomeScreen
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onBack={goToLanding}
        />
      )}
    </div>
  );
}
