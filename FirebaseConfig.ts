import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTdDyE0TSow2JLrAsa1fIj0Y7IqKBUQH0",
  authDomain: "projectdatabase-6cb7d.firebaseapp.com",
  projectId: "projectdatabase-6cb7d",
  storageBucket: "projectdatabase-6cb7d.firebasestorage.app",
  messagingSenderId: "777429071045",
  appId: "1:777429071045:web:d01c71001e58ad73376cac",
  measurementId: "G-3S5E6RXS50"
};

// Initialize Firebase
export const FIREBASE_app = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_app);
export const FIRESTORE_DB = getFirestore(FIREBASE_app);

//all kode hentet fra console firebase.com