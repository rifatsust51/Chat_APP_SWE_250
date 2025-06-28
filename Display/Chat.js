import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import ChatUser from "../components/Messages/ChatUser";
import { UserContext } from "../context/UserContext";

const ChatScreen = ({ navigation }) => {
  // eslint-disable-next-line no-unused-vars
  const { userID, setUserId } = useContext(UserContext);
  const [allFriends, setAllFriends] = useState([]);

  useEffect(() => {
    async function acceptedFriends() {
      try {
        const response = await axios.get(
          "http://192.168.0.102:8000/all-friends/" + userID
        );
        if (response.data.success) {
          setAllFriends(response.data.allFriends);
        }
      } catch (error) {
        console.log(error);
      }
    }
    acceptedFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {allFriends.map((item, index) => (
          <ChatUser key={index} item={item} />
        ))}
      </Pressable>
    </ScrollView>
  );
};

export default ChatScreen;
