import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCwqs0yZTJib_3XKFWTU-AyEuuPkRdqjqc",
  authDomain: "tripmuse-bd0ba.firebaseapp.com",
  projectId: "tripmuse-bd0ba",
  storageBucket: "tripmuse-bd0ba.firebasestorage.app",
  messagingSenderId: "1093723039753",
  appId: "1:1093723039753:web:096ec293150c7daec470d8",
  measurementId: "G-ZEH14RMHYP",
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);