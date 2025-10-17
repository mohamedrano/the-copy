// Service Worker for Drama Analyst App
// Version: 1.0.0
// Caching Strategy: Stale While Revalidate + Network First

const CACHE_NAME = 'drama-analyst-v1.0.0';
const STATIC_CACHE = 'drama-analyst-static-v1.0.0';
const DYNAMIC_CACHE = 'drama-analyst-dynamic-v1.0.0';
const API_CACHE = 'drama-analyst-api-v1.0.0';

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  DYNAMIC: 24 * 60 * 60 * 1000,     // 24 hours
  API: 5 * 60 * 1000,               // 5 minutes
  FONTS: 365 * 24 * 60 * 60 * 1000, // 1 year
  IMAGES: 7 * 24 * 60 * 60 * 1000,  // 7 days
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS files will be added dynamically
  // JS files will be added dynamically
  // Font files will be added dynamically
];

// File patterns for different caching strategies
const CACHE_PATTERNS = {
  STATIC: [/\.(?:js|css|woff2?|ttf|eot)$/],
  IMAGES: [/\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/],
  API: [/\/api\//],
  FONTS: [/\.(?:woff2?|ttf|eot|otf)$/],
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Apply different caching strategies based on request type
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isImageAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
  } else if (isFontAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
  }
});

// Cache First Strategy - for static assets, images, fonts
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still fresh
      if (isCacheFresh(cachedResponse, cacheName)) {
        console.log('📦 Serving from cache:', request.url);
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      console.log('🌐 Fetched from network and cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache first strategy failed:', error);
    
    // Fallback to cache even if stale
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('⚠️ Serving stale cache as fallback:', request.url);
      return cachedResponse;
    }
    
    // Last resort: return a basic response
    return new Response('Resource not available offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Network First Strategy - for API requests
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      console.log('🌐 Network first - fetched and cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, checking cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Serving from cache (network failed):', request.url);
      return cachedResponse;
    }
    
    return new Response('API not available offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Stale While Revalidate Strategy - for HTML pages
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone);
        console.log('🔄 Background update cached:', request.url);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('⚠️ Background fetch failed:', request.url, error);
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    console.log('📦 Serving stale while revalidating:', request.url);
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
  return CACHE_PATTERNS.STATIC.some(pattern => pattern.test(url));
}

function isImageAsset(url) {
  return CACHE_PATTERNS.IMAGES.some(pattern => pattern.test(url));
}

function isFontAsset(url) {
  return CACHE_PATTERNS.FONTS.some(pattern => pattern.test(url));
}

function isAPIRequest(url) {
  return CACHE_PATTERNS.API.some(pattern => pattern.test(url));
}

function isCacheFresh(response, cacheName) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const cacheDate = new Date(dateHeader);
  const now = new Date();
  const age = now.getTime() - cacheDate.getTime();
  
  let maxAge;
  switch (cacheName) {
    case STATIC_CACHE:
      maxAge = CACHE_DURATIONS.STATIC;
      break;
    case DYNAMIC_CACHE:
      maxAge = CACHE_DURATIONS.DYNAMIC;
      break;
    case API_CACHE:
      maxAge = CACHE_DURATIONS.API;
      break;
    default:
      maxAge = CACHE_DURATIONS.DYNAMIC;
  }
  
  return age < maxAge;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  // For example, sync pending API requests when online
  console.log('🔄 Performing background sync...');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('📱 Push notification received:', data);
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'drama-analyst-notification',
      data: data.data,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('✅ Service Worker loaded successfully');

