import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCC-r1zfvRCnvwgCWnyx9BDFN2jgU25WLU",
  authDomain: "data-auto-43146.firebaseapp.com",
  databaseURL: "https://data-auto-43146-default-rtdb.firebaseio.com",
  projectId: "data-auto-43146",
  storageBucket: "data-auto-43146.appspot.com",
  messagingSenderId: "513605107437",
  appId: "1:513605107437:web:bdef083b41caef15dbd6e4",
  measurementId: "G-0KNZR5EYX4"
};

const firebaseConfigNodemcu = {
  apiKey: "AIzaSyCVOb_5-msij8KSTAOvFkF6mF8KG5mWvRE",
  authDomain: "automatizacioni2023.firebaseapp.com",
  databaseURL: "https://automatizacioni2023-default-rtdb.firebaseio.com",
  projectId: "automatizacioni2023",
  storageBucket: "automatizacioni2023.appspot.com",
  messagingSenderId: "878834311737",
  appId: "1:878834311737:web:aad1d14a2a708c2515e3e8",
  measurementId: "G-L04G9RJSG2"
};

// Inicializando Firebase para la app creada para control
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Inicializando Firebase para la app del NodeMCU con el nombre nodemcu
const appNodemcu = initializeApp(firebaseConfigNodemcu, 'nodemcu');

export const db = getDatabase(app);  // db de app de control
export const dbNodemcu = getDatabase(appNodemcu);  // db de app de nodemcu
