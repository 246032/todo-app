import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Animated,
} from 'react-native';
import { useAuth } from './AuthContext.js';

export default function LoginScreen() {
  const { login, register } = useAuth();

  const [mode, setMode]           = useState('login'); // 'login' | 'register'
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [busy, setBusy]           = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    if (mode === 'register' && !name.trim())            return 'お名前を入力してください';
    if (!email.trim())                                  return 'メールアドレスを入力してください';
    if (!/\S+@\S+\.\S+/.test(email))                   return '正しいメールアドレスを入力してください';
    if (!password)                                      return 'パスワードを入力してください';
    if (password.length < 6)                            return 'パスワードは6文字以上にしてください';
    if (mode === 'register' && password !== confirm)    return 'パスワードが一致しません';
    return null;
  };

  const handleSubmit = async () => {
    setError('');
    const err = validate();
    if (err) { setError(err); shake(); return; }
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (e) {
      setError(e.message);
      shake();
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setName(''); setEmail(''); setPassword(''); setConfirm('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>✓</Text>
          </View>
          <Text style={styles.appName}>マイタスク</Text>
          <Text style={styles.tagline}>
            {mode === 'login' ? 'おかえりなさい' : 'アカウントを作成'}
          </Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => switchMode('login')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
              ログイン
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'register' && styles.tabActive]}
            onPress={() => switchMode('register')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
              新規登録
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
          {mode === 'register' && (
            <Field
              label="お名前"
              placeholder="田中 太郎"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}
          <Field
            label="メールアドレス"
            placeholder="mail@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="パスワード"
            placeholder={mode === 'register' ? '6文字以上' : '••••••••'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            rightLabel={showPass ? '隠す' : '表示'}
            onRightPress={() => setShowPass(v => !v)}
          />
          {mode === 'register' && (
            <Field
              label="パスワード（確認）"
              placeholder="もう一度入力"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPass}
            />
          )}

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, busy && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>
                  {mode === 'login' ? 'ログイン' : 'アカウントを作成'}
                </Text>
            }
          </TouchableOpacity>

          {mode === 'login' && (
            <Text style={styles.hint}>
              デモ: taro@example.com / password123
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── 入力フィールド共通コンポーネント ─────────────────────────
function Field({ label, rightLabel, onRightPress, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.wrap}>
      <View style={fieldStyles.labelRow}>
        <Text style={fieldStyles.label}>{label}</Text>
        {rightLabel && (
          <TouchableOpacity onPress={onRightPress}>
            <Text style={fieldStyles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        {...inputProps}
        style={[fieldStyles.input, focused && fieldStyles.inputFocused]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#adb5bd"
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const BLUE = '#007AFF';
const BG   = '#F2F2F7';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  header: { alignItems: 'center', marginBottom: 36 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  logoEmoji: { fontSize: 34, color: '#fff' },
  appName: { fontSize: 28, fontWeight: '700', color: '#1c1c1e', letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: '#6c757d', marginTop: 4 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#e5e5ea',
    borderRadius: 10,
    padding: 3,
    marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6c757d' },
  tabTextActive: { color: '#1c1c1e', fontWeight: '600' },

  form: { gap: 4 },

  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff3b30',
  },
  errorText: { color: '#d00000', fontSize: 13, fontWeight: '500' },

  submitBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  hint: { textAlign: 'center', color: '#adb5bd', fontSize: 12, marginTop: 12 },
});

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#495057' },
  rightLabel: { fontSize: 13, color: BLUE, fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1c1c1e',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputFocused: { borderColor: BLUE },
});
