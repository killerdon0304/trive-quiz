// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyCx_9J_-fSUmsDsLVt5GuiP1ivHBb2lxog",
  authDomain: "freemcqquiz.firebaseapp.com",
  projectId: "freemcqquiz",
  storageBucket: "freemcqquiz.appspot.com",
  messagingSenderId: "372341214414",
  appId: "1:372341214414:web:aae523732d38408333149f",
  measurementId: "G-BT4PQPTF4Y",
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './logo.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});