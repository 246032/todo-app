// firebase.ts
import { initializeApp } from "firebase/app";
// @ts-ignore JS SDK を使う際エラーが出るので ignore つける
// see: https://github.com/firebase/firebase-js-sdk/issues/7584
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";


const firebaseConfig = {
  apiKey: "AIzaSyAOl4RS874dJ9HPwh18tMN4Lpi7teQIHPw",
  authDomain: "team3glasses.firebaseapp.com",
  projectId: "team3glasses",
  storageBucket: "team3glasses.firebasestorage.app",
  messagingSenderId: "609456421341",
  appId: "1:609456421341:web:045d4b3bad82c6b0c2de34"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);