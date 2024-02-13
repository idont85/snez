// firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYKQdzJBf7LUdtOpOE43R_kZOUXH0o2Z0",
  authDomain: "implant-c36db.firebaseapp.com",
  projectId: "implant-c36db",
  storageBucket: "implant-c36db.appspot.com",
  messagingSenderId: "838532639442",
  appId: "1:838532639442:web:f3e4b7e1bb0bcade6c5b0b",
  measurementId: "G-76HH8FJLX7"
};
firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();