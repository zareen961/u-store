importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js')

firebase.initializeApp({
    apiKey: 'AIzaSyC0gnQJ9V0qbI1OBw0XFuBQU2YVd94Xw00',
    authDomain: 'u-store-961.firebaseapp.com',
    projectId: 'u-store-961',
    storageBucket: 'u-store-961.appspot.com',
    messagingSenderId: '887692518639',
    appId: '1:887692518639:web:cb5174bda59e4ecb7f671a',
    measurementId: 'G-WE9VKZPFNC',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload)
    // Customize notification here
    const notificationTitle = 'Background Message Title'
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png',
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})