const cacheVersion = 'v1';
const cacheName = 'pdf-to-svg-' + cacheVersion;

const urlsToCache = [
  "/",
  "/icons/icon.svg",
  "/node_modules/mupdf/dist/mupdf.js",
  "/node_modules/mupdf/dist/mupdf-wasm.js",
  "/node_modules/mupdf/dist/mupdf-wasm.wasm",
];

// On install, cache critical offline resources.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => {
        console.log('Caching URLs');
        return cache.addAll(urlsToCache);
      })
  );
});

// On activate, delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name != cacheName;
          })
          .map((name) => {
            return caches.delete(name);
          })
      );
    }),
  );
});


self.addEventListener('fetch', async (event) => {
  if (event.request.method === 'POST') {
    // Share actions send a POST requests, intercept it and redirect to / 
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const files = formData.getAll('files');
      console.log('Received files from Share action:', files);

      const allWindowsClients = await clients.matchAll();

      if(allWindowsClients.length > 0) {
        console.log("Found clients to send files");
        for (const client of allWindowsClients) {
          client.postMessage({
            files: files
          });
        }
      } else {
        console.error('No clients found to send files to');
      }
      
      return Response.redirect('/', 303);
    })());
  } else {
    // Look for the request in the cache
    // If the request is in the cache, return it
    // Otherwise, fetch from the network and if .js file from CDN, store in cache
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            console.log(`Fetching from network: ${event.request.url}`);
            if (event.request.url.endsWith('.js') && event.request.url.startsWith(cdnPrefix)) { 
              console.log(`Caching ${event.request.url}`);
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    )
  }
});