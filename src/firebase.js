import firebase from "firebase";
import "firebase/auth";

// Copy the config from firebase console. 
// For more details check: https://firebase.google.com/docs/web/setup
let config = {
  apiKey: "AIzaSyAr8q_nx7JctAJ9zwHZfZvsN_bykAgaAWg",
  authDomain: "kaching-dev-env.firebaseapp.com",
  databaseURL: "https://kaching-dev-env.firebaseio.com",
  storageBucket: "kaching-dev-env",
  messagingSenderId: "kaching-dev-env.appspot.com",
  projectId: "24658682929",
  appId: "1:24658682929:web:32d20f0f610ff07fb3a110",
};

const fireBaseApp = firebase.initializeApp(config);

export const firestore = firebase.firestore();
export const auth = firebase.auth();
export default fireBaseApp;