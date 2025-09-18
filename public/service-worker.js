self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // Prendre le contrôle des clients immédiatement
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received");
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
