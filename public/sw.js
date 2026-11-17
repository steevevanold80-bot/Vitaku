// Service worker VITAKU : application utilisable hors ligne + lecture des vidéos téléchargées.
const V = 'vitaku-v1', SHELL = ['/', '/index.html', '/manifest.webmanifest', '/logo.svg']
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'vitaku-videos').map(k => caches.delete(k)))).then(() => self.clients.claim())) })
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url)
  if (r.method !== 'GET') return
  if (u.origin === location.origin && u.pathname.startsWith('/videos/')) return e.respondWith(video(r))
  if (u.origin !== location.origin || u.pathname.endsWith('version.json')) return   // AniList, polices, vérification de version : toujours le réseau
  if (r.mode === 'navigate') return e.respondWith(fetch(r).then(x => { const y = x.clone(); caches.open(V).then(c => c.put('/index.html', y)); return x }).catch(() => caches.match('/index.html')))
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(x => { if (x.ok) { const y = x.clone(); caches.open(V).then(c => c.put(r, y)) } return x })))
})
async function video(r) {
  const c = await caches.open('vitaku-videos'), m = await c.match(r.url)
  if (!m) return fetch(r)
  const range = r.headers.get('range'); if (!range) return m
  const b = await m.blob(), [s, en] = range.replace('bytes=', '').split('-'), a = +s || 0, z = en ? +en : b.size - 1
  return new Response(b.slice(a, z + 1), { status: 206, headers: { 'Content-Type': m.headers.get('Content-Type') || 'video/mp4', 'Content-Range': `bytes ${a}-${z}/${b.size}`, 'Content-Length': z - a + 1 } })
}
