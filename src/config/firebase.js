import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCOCPyzA4xHLFvpFFFJQHKhSa7OQ1U285c",
    authDomain: "control-horas-app-4ca5a.firebaseapp.com",
    projectId: "control-horas-app-4ca5a",
    storageBucket: "control-horas-app-4ca5a.firebasestorage.app",
    messagingSenderId: "103102616497",
    appId: "1:103102616497:web:9c7a59fe223ae12ac0e390",
    measurementId: "G-86FRR10PM6"
};

import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with modern cache settings (replaces deprecated persistence API)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
