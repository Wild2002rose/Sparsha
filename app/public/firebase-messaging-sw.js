importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAs_vTKdJnE73Cw42jiTL1AuBfnmXPJi7o",
  authDomain: "sparsha-7d703.firebaseapp.com",
  projectId: "sparsha-7d703",
  messagingSenderId: "602114386866",
  appId: "1:602114386866:web:86308e69f3714a8857d2ab"
});

const messaging = firebase.messaging();

// For background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log("Service Worker received push", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});
