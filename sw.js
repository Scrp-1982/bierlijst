// Bierlijst: service worker voor meldingen en het getal op het app-icoon
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "Bierlijst", body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    if (self.navigator && "setAppBadge" in self.navigator && d.badge != null) {
      try { await self.navigator.setAppBadge(d.badge); } catch {}
    }
    await self.registration.showNotification(d.title || "Bierlijst", {
      body: d.body || "",
      icon: "apple-touch-icon-v2.png",
      badge: "favicon-32-v2.png",
      tag: d.tag,
      data: { url: d.url || "./#activiteit" },
    });
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./#activiteit", self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if ("focus" in c) { try { await c.navigate(url); } catch {} return c.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
