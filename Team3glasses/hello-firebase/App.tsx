import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';

type Task = {
  id: number;
  title: string;
  done: boolean;
};

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  //タスク読み込み
  useEffect(() => {
    AsyncStorage.getItem('tasks').then((data) => {
      if (data) {
        setTasks(JSON.parse(data));
      }
    });
  }, []);

  //タスク変更後保存
  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  //タスク追加
  const addTask = () => {
    if (task.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: task.trim(),
        done: false,
      };
      setTasks([...tasks, newTask]);
      setTask('');
    } else {
      Alert.alert('タスク名が入力されていません')
    }
  };

  //完了・未完了を切り替え
  const toggleTask = (id: number) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    setTasks(updated);
  };

  //タスク削除
  const deleteTask = (id: number, title: string) => {
    Alert.alert("タスク  " + title + '  を削除しますか？', '', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive',
        onPress: () => {
          setTasks(tasks.filter(t => t.id !== id));
        },
      },
    ]);
  };


  //未完了・完了ごとに分ける
  const incompleteTasks = tasks.filter(t => !t.done);
  const completedTasks = tasks.filter(t => t.done);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ToDoリスト</Text>
      <TextInput
        style={styles.input}
        value={task}
        onChangeText={setTask}
        placeholder="タスク名を入力"
      />
      <Button title="タスク追加" onPress={addTask} />

      <Text style={styles.title}>タスク一覧</Text>
      <FlatList
        style={{ height: 300 }}
        showsVerticalScrollIndicator={true}
        data={incompleteTasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Checkbox
              status={item.done ? 'checked' : 'unchecked'}
              onPress={() => toggleTask(item.id)}
            />
            <Text style={styles.taskText}>{item.title}</Text>
            <Button title="削除" color="red" onPress={() => deleteTask(item.id, item.title)} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />


      <Text style={styles.title} >完了済みタスク一覧</Text>
      <FlatList
        style={{ height: 300 }}
        showsVerticalScrollIndicator={true}
        data={completedTasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Checkbox
              status={item.done ? 'checked' : 'unchecked'}
              onPress={() => toggleTask(item.id)}
            />
            <Text style={[styles.taskText, { color: 'gray' }]}>
              {item.title}
            </Text>
            <Button title="削除" color="red" onPress={() => deleteTask(item.id, item.title)} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    backgroundColor: '#c1ecf3ff',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2196F3',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  title: {
    marginTop: 20,
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 18,
    borderBottomWidth: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskText: {
    flex: 1,
    fontSize: 20,
    marginLeft: 10,
  },
});
