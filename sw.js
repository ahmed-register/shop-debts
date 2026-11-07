const CACHE = "shop-debts-v2";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const save = (r, res) => { if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; };
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (!(u.origin === location.origin || u.hostname === "www.gstatic.com")) return;
  const page = r.mode === "navigate" || u.pathname.endsWith("/index.html") || u.pathname.endsWith("/sw.js");
  if (page) {
    // الصفحة: الشبكة أولاً ليظهر التحديث فوراً، والنسخة المحفوظة عند انقطاع الإنترنت
    e.respondWith(fetch(r).then(res => save(r, res)).catch(() => caches.match(r, { ignoreSearch: true }).then(h => h || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => save(r, res))));
});
