import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, KeyboardAvoidingView, Platform,
  Alert, Animated, Pressable,
} from 'react-native';
import { useAuth } from './AuthContext.js';
import { useTodo, PRIORITIES, FILTERS } from './TodoStore.js';

const BLUE = '#007AFF';
const BG   = '#F2F2F7';

export default function TodoScreen() {
  const { user, logout }             = useAuth();
  const { grouped, stats, filter, setFilter, add, toggle, remove } = useTodo();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ログアウト', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Nav */}
      <View style={styles.navBar}>
        <View>
          <Text style={styles.navTitle}>マイタスク</Text>
          <Text style={styles.navSub}>{user.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={stats.total}  label="合計"   color={BLUE}      />
        <StatCard value={stats.active} label="残り"   color="#1c1c1e"  />
        <StatCard value={stats.done}   label="完了"   color="#34C759"  />
      </View>

      {/* Filter */}
      <View style={styles.segWrap}>
        <View style={styles.seg}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.segBtn, filter === f && styles.segBtnActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segText, filter === f && styles.segTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={grouped.length === 0 ? styles.listEmpty : styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>タスクがありません</Text>
          </View>
        ) : (
          grouped.map(({ priority, items }) => (
            <View key={priority}>
              <View style={styles.sectionHeader}>
                <View style={[styles.priorityDot, { backgroundColor: PRIORITIES[priority].color }]} />
                <Text style={styles.sectionTitle}>優先度：{PRIORITIES[priority].label}</Text>
              </View>
              <View style={styles.card}>
                {items.map((item, idx) => (
                  <TodoRow
                    key={item.id}
                    item={item}
                    isLast={idx === items.length - 1}
                    onToggle={() => toggle(item.id)}
                    onDelete={() => remove(item.id)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Add modal */}
      <AddModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(text, memo, priority) => { add(text, memo, priority); setModalVisible(false); }}
      />
    </View>
  );
}

// ── TodoRow ───────────────────────────────────────────────────
function TodoRow({ item, isLast, onToggle, onDelete }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLongPress = () => {
    Alert.alert('タスクを削除', `"${item.text}" を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除',       style: 'destructive', onPress: onDelete },
    ]);
  };

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[styles.row, !isLast && styles.rowBorder]}
        onPress={handleToggle}
        onLongPress={handleLongPress}
      >
        <View style={[styles.checkCircle, item.isDone && styles.checkCircleDone]}>
          {item.isDone && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <View style={styles.rowContent}>
          <Text
            style={[styles.rowText, item.isDone && styles.rowTextDone]}
            numberOfLines={2}
          >
            {item.text}
          </Text>
          {!!item.memo && (
            <Text style={styles.rowMemo} numberOfLines={1}>{item.memo}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <View style={statStyles.card}>
      <Text style={[statStyles.num, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

// ── AddModal ──────────────────────────────────────────────────
function AddModal({ visible, onClose, onAdd }) {
  const [text,     setText]     = useState('');
  const [memo,     setMemo]     = useState('');
  const [priority, setPriority] = useState('mid');

  const reset = () => { setText(''); setMemo(''); setPriority('mid'); };

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text, memo, priority);
    reset();
  };

  const handleClose = () => { onClose(); reset(); };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={modalStyles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={modalStyles.handle} />
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={modalStyles.cancel}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={modalStyles.title}>新しいタスク</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={[modalStyles.addBtn, !text.trim() && modalStyles.addBtnDisabled]}>
              追加
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={modalStyles.body} keyboardShouldPersistTaps="handled">
          <View style={modalStyles.section}>
            <Text style={modalStyles.fieldLabel}>タスク名</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="例：資料を作成する"
              placeholderTextColor="#adb5bd"
              value={text}
              onChangeText={setText}
              autoFocus
              returnKeyType="next"
            />
          </View>
          <View style={modalStyles.section}>
            <Text style={modalStyles.fieldLabel}>メモ（任意）</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="詳細を入力"
              placeholderTextColor="#adb5bd"
              value={memo}
              onChangeText={setMemo}
            />
          </View>
          <View style={modalStyles.section}>
            <Text style={modalStyles.fieldLabel}>優先度</Text>
            <View style={modalStyles.priorityRow}>
              {['high', 'mid', 'low'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    modalStyles.priorityBtn,
                    { borderColor: PRIORITIES[p].color },
                    priority === p && { backgroundColor: PRIORITIES[p].color },
                  ]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    modalStyles.priorityText,
                    { color: priority === p ? '#fff' : PRIORITIES[p].color },
                  ]}>
                    {PRIORITIES[p].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  navBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: BG,
  },
  navTitle: { fontSize: 32, fontWeight: '700', color: '#1c1c1e', letterSpacing: -0.5 },
  navSub:   { fontSize: 13, color: '#6c757d', marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  logoutText: { fontSize: 13, color: '#6c757d', fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },

  segWrap: { paddingHorizontal: 16, marginBottom: 8 },
  seg: {
    flexDirection: 'row', backgroundColor: '#e5e5ea',
    borderRadius: 10, padding: 3,
  },
  segBtn:       { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  segBtnActive: { backgroundColor: '#fff' },
  segText:      { fontSize: 13, fontWeight: '500', color: '#6c757d' },
  segTextActive:{ color: '#1c1c1e', fontWeight: '600' },

  list:        { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  listEmpty:   { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState:  { alignItems: 'center' },
  emptyIcon:   { fontSize: 48, color: '#dee2e6', marginBottom: 12 },
  emptyText:   { fontSize: 16, color: '#adb5bd' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 4,
  },
  priorityDot:  { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6c757d', textTransform: 'uppercase', letterSpacing: 0.5 },

  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 4 },

  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: '#f2f2f7' },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#c7c7cc',
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: '#34C759', borderColor: '#34C759' },
  checkMark: { fontSize: 12, color: '#fff', fontWeight: '700' },
  rowContent: { flex: 1 },
  rowText:    { fontSize: 16, color: '#1c1c1e' },
  rowTextDone:{ color: '#adb5bd', textDecorationLine: 'line-through' },
  rowMemo:    { fontSize: 12, color: '#adb5bd', marginTop: 3 },

  fab: {
    position: 'absolute', bottom: 36, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: BLUE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  num:   { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 11, color: '#adb5bd', fontWeight: '500', marginTop: 2 },
});

const modalStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  handle: {
    width: 36, height: 5, borderRadius: 3,
    backgroundColor: '#dee2e6', alignSelf: 'center', marginTop: 10,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#e5e5ea',
  },
  title:  { fontSize: 16, fontWeight: '700', color: '#1c1c1e' },
  cancel: { fontSize: 16, color: '#6c757d' },
  addBtn: { fontSize: 16, color: BLUE, fontWeight: '700' },
  addBtnDisabled: { opacity: 0.35 },

  body: { flex: 1, padding: 20 },
  section: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#495057', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: '#1c1c1e',
    borderWidth: 1.5, borderColor: 'transparent',
  },

  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center',
  },
  priorityText: { fontSize: 15, fontWeight: '600' },
});
