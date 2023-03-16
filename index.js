// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCC-r1zfvRCnvwgCWnyx9BDFN2jgU25WLU",
  authDomain: "data-auto-43146.firebaseapp.com",
  projectId: "data-auto-43146",
  storageBucket: "data-auto-43146.appspot.com",
  messagingSenderId: "513605107437",
  appId: "1:513605107437:web:bdef083b41caef15dbd6e4",
  measurementId: "G-0KNZR5EYX4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

const auth = getAuth(app);  // modulo de autentificacion
const db = getFirestore(app);  // modulo de firestore o db

// Detectar si hay usuario autentificado
onAuthStateChanged(auth, user => {
  if (user !== null) {
    console.log("Logged in");
  } else {
    console.log("No user");
  }
})