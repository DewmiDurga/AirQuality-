// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDr6hnqboCwMwCPjZ8IxOyMd3Cmm8dno7Q",
//   authDomain: "breath-easy-2.firebaseapp.com",
//   projectId: "breath-easy-2",
//   storageBucket: "breath-easy-2.firebasestorage.app",
//   messagingSenderId: "84398503179",
//   appId: "1:84398503179:web:6c163364bdb72b9c995e0e",
//   measurementId: "G-CRYX5TELTJ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// src/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDr6hnqboCwMwCPjZ8IxOyMd3Cmm8dno7Q",
  authDomain: "breath-easy-2.firebaseapp.com",
  projectId: "breath-easy-2",
  storageBucket: "breath-easy-2.firebasestorage.app",
  messagingSenderId: "84398503179",
  appId: "1:84398503179:web:6c163364bdb72b9c995e0e",
  databaseURL: "https://breath-easy-2-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
export default app;