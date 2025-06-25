import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAs_vTKdJnE73Cw42jiTL1AuBfnmXPJi7o",
  authDomain: "sparsha-7d703.firebaseapp.com",
  projectId: "sparsha-7d703",
  storageBucket: "sparsha-7d703.firebasestorage.app",
  messagingSenderId: "602114386866",
  appId: "1:602114386866:web:86308e69f3714a8857d2ab",
  measurementId: "G-WVJF1W1JM7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_PUBLIC_VAPID_KEY", 
    });
    console.log("FCM Token:", token);
    return token;
  } else {
    console.warn("Notification permission denied.");
    return null;
  }
};

onMessage(messaging, (payload) => {
  console.log("Push received in foreground:", payload);
  alert(`${payload.notification.title}: ${payload.notification.body}`);
});