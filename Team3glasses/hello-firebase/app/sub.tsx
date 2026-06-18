import React from "react";
import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function Sub() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>遷移先</Text>
      <Button title="戻る" onPress={() => router.back()} />
    </View>
  );
}
