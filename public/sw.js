self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_error) { payload = {}; }
  const title = payload.title || 'MRFQ';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/assets/logos/mrfq-logo-icon-light-v4.svg',
    badge: payload.badge || '/assets/logos/mrfq-favicon.svg',
    dir: payload.dir || 'rtl',
    lang: payload.lang || 'ar',
    tag: payload.tag || `mrfq-${Date.now()}`,
    data: { url: payload.url || '/' },
    timestamp: payload.timestamp || Date.now()
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

function urlBase64ToUint8Array(value) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(char => char.charCodeAt(0)));
}

// The browser can silently rotate a push subscription; re-subscribe with the
// current VAPID key and report it to the server so background pushes keep working.
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil((async () => {
    try {
      const res = await fetch('/api/push/public-key', { credentials: 'include' });
      if (!res.ok) return;
      const { publicKey } = await res.json();
      if (!publicKey) return;
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
    } catch (_error) {}
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(targetUrl);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});
