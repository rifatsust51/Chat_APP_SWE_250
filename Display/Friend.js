import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import FriendRequest from "../components/Messages/FriendRequest";
import { UserContext } from "../context/UserContext";

const FriendsScreen = () => {
  // eslint-disable-next-line no-unused-vars
  const { userID, setUserId } = useContext(UserContext);
  const [friendRequests, sentFriendRequests] = useState([]);

  useEffect(() => {
    try {
      async function fetchFriendRequests() {
        const response = await axios.get(
          "http://192.168.0.102:8000/requests/" + userID
        );
        if (response.data.success) {
          const requests = response.data.friendRequests.map((request) => ({
            _id: request._id,
            name: request.name,
            image: request.image,
            email: request.email,
          }));
          sentFriendRequests(requests);
        }
      }
      fetchFriendRequests();
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ padding: 10, marginHorizontal: 12 }}>
      {friendRequests.length > 0 && <Text>Your Friend Requests</Text>}
      {friendRequests.map((item, index) => (
        <FriendRequest
          key={index}
          item={item}
          friendRequests={friendRequests}
          sentFriendRequests={sentFriendRequests}
        />
      ))}
    </View>
  );
};

export default FriendsScreen;
