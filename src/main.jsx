import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/landing.css';

// Service Worker 등록 + 자동 업데이트
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[SW] Registered');

        // 1시간마다 업데이트 체크
        setInterval(() => reg.update(), 60 * 60 * 1000);

        // 새 버전 감지 시 자동 적용
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New version available - reloading...');
              // 새 버전 자동 적용 후 새로고침
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              setTimeout(() => window.location.reload(), 500);
            }
          });
        });
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));

    // SW 컨트롤러 변경 감지 (다른 탭에서 업데이트된 경우)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
