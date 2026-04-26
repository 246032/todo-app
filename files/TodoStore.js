import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoContext = createContext(null);

export const PRIORITIES = {
  high: { label: '高', color: '#FF3B30' },
  mid:  { label: '中', color: '#FF9500' },
  low:  { label: '低', color: '#34C759' },
};

export const FILTERS = ['すべて', '未完了', '完了済み'];

export function TodoProvider({ userId, children }) {
  const [todos,  setTodos]  = useState([]);
  const [filter, setFilter] = useState('すべて');

  const key = `todos_v2_${userId}`;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        setTodos(raw ? JSON.parse(raw) : sampleTodos());
      } catch (_) {
        setTodos(sampleTodos());
      }
    })();
  }, [userId]);

  const persist = async (next) => {
    setTodos(next);
    try { await AsyncStorage.setItem(key, JSON.stringify(next)); } catch (_) {}
  };

  const add = (text, memo = '', priority = 'mid') => {
    if (!text.trim()) return;
    const item = {
      id: Date.now().toString(),
      text: text.trim(),
      memo: memo.trim(),
      isDone: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    persist([item, ...todos]);
  };

  const toggle = (id) =>
    persist(todos.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));

  const remove = (id) =>
    persist(todos.filter(t => t.id !== id));

  const filtered = todos.filter(t => {
    if (filter === '未完了')  return !t.isDone;
    if (filter === '完了済み') return t.isDone;
    return true;
  });

  const grouped = ['high', 'mid', 'low'].reduce((acc, p) => {
    const items = filtered.filter(t => t.priority === p);
    if (items.length) acc.push({ priority: p, items });
    return acc;
  }, []);

  const stats = {
    total:  todos.length,
    active: todos.filter(t => !t.isDone).length,
    done:   todos.filter(t =>  t.isDone).length,
  };

  return (
    <TodoContext.Provider value={{ todos, filtered, grouped, stats, filter, setFilter, add, toggle, remove }}>
      {children}
    </TodoContext.Provider>
  );
}

export const useTodo = () => useContext(TodoContext);

function sampleTodos() {
  return [
    { id: '1', text: 'プロジェクト計画書を作成',  memo: '来週月曜締め切り', isDone: false, priority: 'high',  createdAt: new Date().toISOString() },
    { id: '2', text: 'チームミーティングの準備',   memo: 'アジェンダ作成',   isDone: false, priority: 'high',  createdAt: new Date().toISOString() },
    { id: '3', text: 'メールの返信',               memo: '',                isDone: false, priority: 'mid',   createdAt: new Date().toISOString() },
    { id: '4', text: '週次レポートを提出',          memo: '',                isDone: true,  priority: 'mid',   createdAt: new Date().toISOString() },
    { id: '5', text: '読書：Clean Architecture', memo: '3章まで',          isDone: false, priority: 'low',   createdAt: new Date().toISOString() },
  ];
}
