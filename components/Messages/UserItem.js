import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { UserContext } from "../../context/UserContext";

const UserItem = ({ item }) => {
  // eslint-disable-next-line no-unused-vars
  const { userID, setUserId } = useContext(UserContext);
  const [requestSent, setRequestSent] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  useEffect(() => {
    async function fetchUserFriends() {
      try {
        const response = await axios.get(
          "http://192.168.0.102:8000/all-friends/" + userID
        );
        if (response.data.success) {
          setUserFriends(response.data.allFriends);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchUserFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, friendRequests, requestSent, userFriends]);

  useEffect(() => {
    async function fetchFriendRequests() {
      try {
        const response = await axios.get(
          "http://192.168.0.102:8000/sent-requests/" + userID
        );
        if (response.data.success) {
          setFriendRequests(response.data.sentRequests);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchFriendRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendFriendRequest(currentUserID, selectedUserID) {
    try {
      const response = await axios.post(
        "http://192.168.0.102:8000/friend-request",
        {
          currentUserID,
          selectedUserID,
        }
      );

      if (response.data.success) {
        console.log(response.data.message);
        setRequestSent(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Pressable
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
    >
      <View>
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: "cover",
          }}
          source={{ uri: item?.image }}
        />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>
        <Text style={{ marginTop: 4, color: "gray" }}>{item?.email}</Text>
      </View>
      {userFriends && userFriends.some((friend) => friend._id === item._id) ? (
        <Pressable
          style={{
            backgroundColor: "#1fb54f",
            padding: 10,
            width: 120,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: "center", color: "white" }}>Friends</Text>
        </Pressable>
      ) : requestSent ||
        (friendRequests.length > 0 &&
          friendRequests.some((friend) => friend._id === item._id)) ? (
        <Pressable
          style={{
            backgroundColor: "gray",
            padding: 10,
            width: 120,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Request Sent
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userID, item._id)}
          style={{
            backgroundColor: "#567189",
            padding: 10,
            borderRadius: 6,
            width: 120,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Add Friend
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default UserItem;
