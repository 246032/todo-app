import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { app } from "./firebase";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test, Firebase 👋</Text>
      <Text>app name: {app.name}</Text>
      <Text>projectId: {app.options.projectId}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
});