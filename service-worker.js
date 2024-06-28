// service-worker.js

// 定义缓存的名称
const CACHE_NAME = 'my-web-app-cache';

// 缓存需要离线访问的资源
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/icon.png',
    '/css/styles.css',
    '/js/script.js',
    '/js/service-worker.js',
    '/js/smoothie.js',
    '/js/echarts.min.js'
    // '/images/logo.png'
    // 添加更多需要缓存的资源路径
];

// 监听安装事件，缓存指定的资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
              return cache.addAll(urlsToCache);
          })
    );
});

// 拦截网络请求，并从缓存中响应
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
          .then(response => {
              // 缓存命中，返回缓存的响应
              if (response) {
                  return response;
              }
              // 否则，使用网络请求资源
              return fetch(event.request);
          })
    );
});

// 监听激活事件，清理旧版本缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
