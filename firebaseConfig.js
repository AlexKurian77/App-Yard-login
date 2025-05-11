import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, signInWithCredential, PhoneAuthProvider, RecaptchaVerifier, GoogleAuthProvider, linkWithCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAT9kgqNojAPzgsFNrUGtVANoAhd0Uc1Gg",
  authDomain: "app-yard-demo.firebaseapp.com",
  projectId: "app-yard-demo",
  storageBucket: "app-yard-demo.firebasestorage.app",
  messagingSenderId: "548563707987",
  appId: "1:548563707987:web:69a51524c604bec808fea6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithPhoneNumber, signInWithCredential, PhoneAuthProvider, RecaptchaVerifier, GoogleAuthProvider, linkWithCredential };
