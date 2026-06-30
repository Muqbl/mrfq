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
