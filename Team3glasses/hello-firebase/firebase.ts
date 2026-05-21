// firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAOl4RS874dJ9HPwh18tMN4Lpi7teQIHPw",
  authDomain: "team3glasses.firebaseapp.com",
  projectId: "team3glasses",
  storageBucket: "team3glasses.firebasestorage.app",
  messagingSenderId: "609456421341",
  appId: "1:609456421341:web:045d4b3bad82c6b0c2de34"
};

export const app = initializeApp(firebaseConfig);