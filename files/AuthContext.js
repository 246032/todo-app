import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// Fake user DB (demo用 — 本番ではサーバー認証に置き換えてください)
const USERS_KEY = 'todo_users_v1';
const SESSION_KEY = 'todo_session_v1';

const seedUsers = [
  { id: '1', name: '田中 太郎', email: 'taro@example.com', password: 'password123' },
];

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // null = ログアウト中
  const [loading, setLoading] = useState(true);

  // 起動時にセッション復元
  useEffect(() => {
    (async () => {
      try {
        // users DB が空なら seed を書き込む
        const raw = await AsyncStorage.getItem(USERS_KEY);
        if (!raw) {
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
        }
        // セッション復元
        const sessionRaw = await AsyncStorage.getItem(SESSION_KEY);
        if (sessionRaw) {
          setUser(JSON.parse(sessionRaw));
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  // ログイン
  const login = async (email, password) => {
    const raw   = await AsyncStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : seedUsers;
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );
    if (!found) throw new Error('メールアドレスまたはパスワードが違います');
    const session = { id: found.id, name: found.name, email: found.email };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  // 新規登録
  const register = async (name, email, password) => {
    const raw   = await AsyncStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [...seedUsers];
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      throw new Error('このメールアドレスはすでに登録されています');
    }
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    };
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  // ログアウト
  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
