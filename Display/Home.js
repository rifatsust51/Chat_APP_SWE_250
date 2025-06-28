import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import UserItem from "../components/Messages/UserItem";
import { UserContext } from "../context/UserContext";

const HomeScreen = ({ navigation }) => {
  // eslint-disable-next-line no-unused-vars
  const { userID, setUserId } = useContext(UserContext);
  const [users, setUsers] = useState([]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        onPress: async () => {
          await AsyncStorage.removeItem("authToken");
          setUserId(null);
          navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
          });
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: {
        backgroundColor: "#fff", // Makes icons more visible
      },
      headerLeft: () => (
        <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 10 }}>
          Native Chat
        </Text>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <MaterialIcons
            name="logout"
            size={24}
            color="black"
            onPress={handleLogout}
            style={{ marginHorizontal: 8 }}
          />
          <Ionicons
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
            onPress={() => navigation.navigate("ChatScreen")}
            style={{ marginHorizontal: 8 }}
          />
          <Ionicons
            name="people-outline"
            size={24}
            color="black"
            onPress={() => navigation.navigate("FriendsScreen")}
            style={{ marginHorizontal: 8 }}
          />
        </View>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;

        const decodedToken = jwtDecode(token);
        const id = decodedToken.userID;

        setUserId(id);

        const response = await axios.get(
          `http://192.168.0.102:8000/users/${id}`
        );
        setUsers(response.data?.users || []);
      } catch (error) {
        console.log("Error fetching users", error);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ padding: 10 }}>
        <Text style={{ padding: 10, fontWeight: "bold", color: "gray" }}>
          People using Native Chat
        </Text>
        {users.map((item, index) => (
          <UserItem key={index} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
