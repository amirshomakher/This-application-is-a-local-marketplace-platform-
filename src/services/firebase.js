// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq5yQMcdoFkbwd8oy4xsMHmo6ASVwIdCY",
  authDomain: "ecommerce-pannel.firebaseapp.com",
  projectId: "ecommerce-pannel",
  storageBucket: "ecommerce-pannel.firebasestorage.app",
  messagingSenderId: "958405115701",
  appId: "1:958405115701:web:5530f6444fc82e505f567c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);