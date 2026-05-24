// 비밀고백 PWA Service Worker - v5 (network-first)
const CACHE_VERSION = 'bimilgobaek-v6.5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// 설치 - 즉시 활성화 (대기 안 함)
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v4.1');
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // 즉시 새 워커로 교체
});

// 활성화 - 옛 캐시 모두 삭제
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v4.1 - clearing old caches');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION) // 현재 버전 외 전부 삭제
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim()) // 모든 탭에 즉시 적용
  );
});

// fetch - Network First 전략 (네트워크 우선, 실패 시 캐시)
self.addEventListener('fetch', (event) => {
  // Supabase, API 요청은 항상 네트워크
  if (event.request.url.includes('supabase') ||
      event.request.url.includes('/api/')) return;

  // GET 요청만 처리
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 성공 시 캐시 업데이트
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서
        return caches.match(event.request);
      })
  );
});

// 메시지 핸들러 - 클라이언트에서 강제 업데이트 요청 가능
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
