
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyBinNYoP9TruPmfzOeQtM7ajhdMv00lZfk",
  authDomain: "mindwell-f5a26.firebaseapp.com",
  projectId: "mindwell-f5a26",
  storageBucket: "mindwell-f5a26.appspot.com",
  messagingSenderId: "571613946691",
  appId: "1:571613946691:web:5678d09ee6e7d14c9145f6",
  measurementId: "G-437WL0G5Q4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore()
export { app, db };