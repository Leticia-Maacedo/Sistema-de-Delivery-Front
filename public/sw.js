/* Service worker do EntregaFood: recebe as notificações push do back-end
   (app/core/push.py) e as mostra, mesmo com a aba fechada. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = { corpo: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(dados.titulo || "EntregaFood", {
      body: dados.corpo || "",
      tag: dados.tag || undefined,
      renotify: Boolean(dados.tag),
      data: { url: dados.url || "/" },
    }),
  );
});

// Clique na notificação: foca a aba aberta do site ou abre uma nova.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((abas) => {
      const aba = abas.find((a) => a.url.startsWith(self.location.origin));
      if (aba) return aba.focus();
      return self.clients.openWindow(url);
    }),
  );
});
