// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB4fM9yww8wCUSW4I5mA6Ijc4P0aDmQrZY",
  authDomain: "netflix-db313.firebaseapp.com",
  projectId: "netflix-db313",
  storageBucket: "netflix-db313.appspot.com", // fixed `.app` typo
  messagingSenderId: "135508907284",
  appId: "1:135508907284:web:eb82d53578bb662140de01",
  measurementId: "G-BJ82BBL3RL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
