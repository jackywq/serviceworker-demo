// install事件：只有第一次加载会执行
self.addEventListener("install", function (event) {
  console.log("注册install事件");
  // skipWaiting：可防止出现等待情况，这意味着 Service Worker 在安装完后立即激活
  self.skipWaiting();
  // waitUntil：确保 Service Worker 脚本在完成某些操作后再继续执行后续的生命周期事件
  event.waitUntil(
    // 将/list路径缓存到v1下
    caches.open("v1").then(function (cache) {
      return cache.addAll(["http://localhost:3000/list"]);
    })
  );
});

// activate事件：激活serviceworker
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// fetch事件：监听、拦截fetch请求
self.addEventListener("fetch", async (event) => {
  console.log("拦截fetch", event);
  if (event.request.url.endsWith("/list") && self.isCache) {
    // 缓存
    // event.respondWith: 保证接口请求能够被serviceworker响应
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          // 命中缓存，直接返回
          return response;
        } else {
          let request = event.request.clone();
          return fetch(request)
            .then(function (res) {
              if (!res || res?.status !== 200) {
                // 接口返回异常
                return res;
              }

              const responseClone = res.clone();
              caches.open("v1").then(function (cache) {
                console.log("重新设置缓存");
                cache.put(event.request, responseClone);
              });
            })
            .catch(function (reason) {
              console.error("ServiceWorker fetch failed: ", reason);
            });
        }
      })
    );
  } else {
    // 不缓存
    // 直接从网络获取资源
    event.respondWith(fetch(event.request));
  }
});

// message事件：接收来自主线程的消息，并往主线程发送消息
self.addEventListener("message", function (e) {
  self.isCache = e.data.isCache;
});
