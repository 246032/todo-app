import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, TextInput } from "react-native-paper";

export default function Sub() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("tasks").then((data) => {
      if (data) {
        const tasks = JSON.parse(data);
        const currentTask = tasks.find((t: any) => t.id.toString() === id);
        if (currentTask ) {
          setTitle(currentTask.title || "");
          setDetail(currentTask.detail || "");
        }
      }
    });
  }, [id]);

  const saveDetail = async () => {
    if(!title.trim()){
      Alert.alert("タスク名を入力してください");
      return;
    }
    try {
      const data = await AsyncStorage.getItem("tasks");
      if (data) {
        const tasks = JSON.parse(data);
        const updatedTasks = tasks.map((t: any) =>
          t.id.toString() === id ? { ...t, title: title.trim(), detail: detail } : t
        );
        await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
        Alert.alert("保存しました");
        router.back();
      }
    } catch (error) {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>†タスク編集†</Text>
      
      <Text style={styles.title}>タスク名</Text>
            <TextInput
        mode="outlined"
        placeholder="ここに詳細を入力してください"
        value={title}
        onChangeText={setTitle}
        style={styles.input1}
      />

      <Text style={styles.title}>詳細内容</Text>
      <TextInput
        mode="outlined"
        placeholder="ここに詳細を入力してください"
        value={detail}
        onChangeText={setDetail}
        multiline
        numberOfLines={4}
        style={styles.input2}
      />

      <Button mode="contained" onPress={saveDetail} style={styles.button1}>
        保存
      </Button>
      
      <Button mode="outlined" onPress={() => router.back()} style={styles.button2} textColor="#555">
        キャンセル
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#c1ecf3ff",
    justifyContent: "center",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#8d1e02",
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  input1: {
    marginBottom: 20,
    height: 30,
    backgroundColor: "#fff",
  },
  input2: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button1: {
    backgroundColor: "#2196f3",
    marginTop: 10,
  },
  button2: {
    marginTop: 10,
  },
});
