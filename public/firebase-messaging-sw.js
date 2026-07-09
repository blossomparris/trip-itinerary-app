importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCwqs0yZTJib_3XKFWTU-AyEuuPkRdqjqc",
  authDomain: "tripmuse-bd0ba.firebaseapp.com",
  projectId: "tripmuse-bd0ba",
  storageBucket: "tripmuse-bd0ba.firebasestorage.app",
  messagingSenderId: "1093723039753",
  appId: "1:1093723039753:web:096ec293150c7daec470d8",
  measurementId: "G-ZEH14RMHYP",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload?.notification?.title || payload?.data?.title || "EuroSummer2026";
  const notificationOptions = {
    body:
      payload?.notification?.body ||
      payload?.data?.body ||
      "You have a new trip update.",
    icon: "/icon.png",
    badge: "/icon.png",
    data: {
      url: payload?.fcmOptions?.link || payload?.data?.url || "/",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
