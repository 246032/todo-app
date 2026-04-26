import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './AuthContext.js';
import { TodoProvider } from './TodoStore.js';
import LoginScreen from './LoginScreen.js';
import TodoScreen from './TodoScreen.js';

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

// ── Navigator: ログイン状態で画面切り替え ─────────────────────
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 未ログイン → ログイン画面
  if (!user) {
    return <LoginScreen />;
  }

  // ログイン済み → Todoをユーザー別に管理
  return (
    <TodoProvider userId={user.id}>
      <TodoScreen />
    </TodoProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
});
