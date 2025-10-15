// firebase.js
// Import modul Firebase (pakai CDN modern)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// (Opsional, kalau nanti butuh database, auth, storage)
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// Konfigurasi project kamu
const firebaseConfig = {
  apiKey: "AIzaSyC72gneAx92bF4Qv6Bfi8e1Oxep34uM-u8",
  authDomain: "bubunkitchen-f3945.firebaseapp.com",
  projectId: "bubunkitchen-f3945",
  storageBucket: "bubunkitchen-f3945.appspot.com", // ✅ ubah ke appspot.com
  messagingSenderId: "819501089471",
  appId: "1:819501089471:web:ee2e0eeb3068106abefc0a",
  measurementId: "G-4Z5JFDGFD9"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Export biar bisa dipakai file lain
export { app, analytics, db, auth, storage };
