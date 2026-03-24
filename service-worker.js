 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/service-worker.js b/service-worker.js
new file mode 100644
index 0000000000000000000000000000000000000000..149dea07f17eec25d1446893ff0764ce067fd2c5
--- /dev/null
+++ b/service-worker.js
@@ -0,0 +1,41 @@
+const CACHE_NAME = 'conectados-v1';
+const APP_SHELL = [
+  './',
+  './index.html',
+  './manifest.json',
+  './icons/icon-192.svg',
+  './icons/icon-512.svg'
+];
+
+self.addEventListener('install', (event) => {
+  event.waitUntil(
+    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
+  );
+  self.skipWaiting();
+});
+
+self.addEventListener('activate', (event) => {
+  event.waitUntil(
+    caches.keys().then((keys) =>
+      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
+    )
+  );
+  self.clients.claim();
+});
+
+self.addEventListener('fetch', (event) => {
+  if (event.request.method !== 'GET') return;
+
+  event.respondWith(
+    caches.match(event.request).then((cached) => {
+      if (cached) return cached;
+      return fetch(event.request)
+        .then((response) => {
+          const copy = response.clone();
+          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
+          return response;
+        })
+        .catch(() => caches.match('./index.html'));
+    })
+  );
+});
 
EOF
)
