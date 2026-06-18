 import { StatusBar } from "expo-status-bar";
 import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import { LoginScreen } from "./components/LoginScreen";
import { HomeScreen } from "./components/HomeScreen";

 export default function App() {
   const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
     return unsubscribe;
   }, []);

  if (loading) return null; // 起動時の永続化チェック中

   return (
    <>
      {user ? <HomeScreen user={user} /> : <LoginScreen />}
      <StatusBar style="auto" />
    </>
   );
 }