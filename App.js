import { StatusBar } from "expo-status-bar";
import { useContext, useEffect } from "react";
import { StyleSheet } from "react-native";
import "react-native-get-random-values";
import { io } from "socket.io-client";
import UserContextProvider, { UserContext } from "./context/UserContext";
import StackNavigator from "./navigators/StackNavigator";

const socket = io("http://192.168.0.102:8000"); // your backend URL

function AppContent() {
  const { userID } = useContext(UserContext);

  useEffect(() => {
    if (userID) {
      socket.emit("user-online", userID);
    }
  }, [userID]);

  return <StackNavigator />;
}

export default function App() {
  return (
    <>
      <StatusBar style="" />
      <UserContextProvider>
        <AppContent />
      </UserContextProvider>
    </>
  );
}

// eslint-disable-next-line no-unused-vars
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
