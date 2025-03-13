// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
initializeApp(firebaseConfig)
//const analytics = getAnalytics(app);
const db = getFirestore()
export default db