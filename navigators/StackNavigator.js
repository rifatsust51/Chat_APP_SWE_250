import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import ChatScreen from "../Display/Chat";
import DirectMessageScreen from "../Display/DirectMessage";
import FriendsScreen from "../Display/Friend";
import HomeScreen from "../Display/Home";
import LoginScreen from "../Display/Login";
import RegisterScreen from "../Display/Register";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen
          name="FriendsScreen"
          component={FriendsScreen}
          options={{ title: "Friend Requests" }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ title: "Chats" }}
        />
        <Stack.Screen
          name="DMScreen"
          component={DirectMessageScreen}
          options={{ title: "DM USER" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

// eslint-disable-next-line no-unused-vars
const styles = StyleSheet.create({});
