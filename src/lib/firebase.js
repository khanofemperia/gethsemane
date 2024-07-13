import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAThEjwKUg5MxUZQ4sxaBe-DzMez7ngcpY",
  authDomain: "project-2456.firebaseapp.com",
  projectId: "project-2456",
  storageBucket: "project-2456.appspot.com",
  messagingSenderId: "146913101010",
  appId: "1:146913101010:web:1c91bb2bb111098abcd90b",
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp(); // Ensure that Firebase is not initialized multiple times.
export const database = getFirestore(app);
