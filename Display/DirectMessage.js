/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Text,
  TextInput,
  View,
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { UserContext } from "../context/UserContext";

const DirectMessageScreen = ({ navigation, route }) => {
  const { userID, setUserId } = useContext(UserContext);
  const [image, setImage] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [message, setMessage] = useState("");
  const [receiverData, setReceiverData] = useState();
  const [conversation, setConversation] = useState([]);
  const flatListRef = useRef(null);

  function scrollTobottom() {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }

  useLayoutEffect(() => {
    scrollTobottom();
  }, []);

  useEffect(() => {
    async function fetchReceiverData() {
      try {
        const response = await axios.get(
          "http://192.168.0.102:8000/user/" + route.params.target
        );
        if (response.data.success) {
          setReceiverData(response.data.user);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchReceiverData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 15,
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            onPress={() => navigation.goBack()}
          />
          <Image
            style={{
              width: 35,
              height: 35,
              borderRadius: 20,
              resizeMode: "cover",
            }}
            source={{ uri: receiverData?.image }}
          />
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {receiverData?.name}
          </Text>
        </View>
      ),
    });
  }, []);

  async function fetchMessages() {
    try {
      const response = await axios.get(
        `http://192.168.0.102:8000/messages/${userID}/${route.params.target}`
      );
      if (response.data.success) {
        setConversation(response.data.messages);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  function handleEmojiPress() {
    setShowEmoji((prev) => !prev);
  }

  const handleSend = async (
    messageType,
    fileName = "image.jpg",
    fileType = "image/jpeg",
    imageUri
  ) => {
    try {
      const formData = new FormData();
      formData.append("senderID", userID);
      formData.append("receiverID", route.params.target);

      if (messageType === "image") {
        formData.append("messageType", "image");
        const file = {
          uri: imageUri,
          name: fileName,
          type: fileType,
        };
        formData.append("imageFile", file);
      } else {
        formData.append("messageType", "text");
        formData.append("message", message);
      }

      const response = await fetch("http://192.168.0.102:8000/messages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.log("error in sending the message", error);
    }
  };

  function formatTime(time) {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  }

  function messageRenderer(itemData) {
    const isSender = itemData.item.senderID._id === userID;
    const styles = {
      backgroundColor: isSender ? "#2f87e0" : "#c3c3c3",
      padding: 10,
      alignSelf: isSender ? "flex-end" : "flex-start",
      borderRadius: 10,
      margin: 5,
      maxWidth: "60%",
      textAlign: "left",
    };

    if (itemData.item.messageType === "image") {
      const imageUrl = itemData.item.imageURL;
      const fullImageUrl = imageUrl
        ? `http://192.168.0.102:8000${imageUrl}`
        : null;

      return (
        <View style={styles}>
          {fullImageUrl ? (
            <Image
              style={{ width: 200, height: 200 }}
              source={{ uri: fullImageUrl }}
              resizeMode="contain"
            />
          ) : (
            <Text>Image not available</Text>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles}>
          <Text style={{ color: isSender ? "white" : "black", fontSize: 16 }}>
            {itemData.item.message}
          </Text>
          <Text
            style={{
              textAlign: "right",
              fontSize: 10,
              color: isSender ? "#d0d0d0" : "gray",
              marginTop: 2,
            }}
          >
            {formatTime(itemData.item.timeStamp)}
          </Text>
        </View>
      );
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileName =
        asset.fileName ||
        asset.uri.split("/").pop() ||
        `image_${Date.now()}.jpg`;
      const fileType =
        asset.type || (fileName.endsWith(".png") ? "image/png" : "image/jpeg");
      handleSend("image", fileName, fileType, asset.uri);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: "#F0F0F0" }}
    >
      <FlatList
        ref={flatListRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={() => scrollTobottom()}
        data={conversation}
        keyExtractor={(item, index) => (item._id ? item._id : index.toString())}
        renderItem={messageRenderer}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: showEmoji ? 0 : 25,
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          name="emoji-happy"
          size={24}
          color="gray"
        />

        <TextInput
          placeholder="Type your message"
          placeholderTextColor={"gray"}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
            fontSize: 15,
          }}
          value={message}
          onChangeText={(text) => setMessage(text)}
        />

        <Entypo name="camera" size={24} color="gray" onPress={pickImage} />

        <Feather
          style={{
            backgroundColor: "#0073b6",
            padding: 5,
            paddingTop: 7,
            paddingRight: 7,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => handleSend("text")}
          name="send"
          size={24}
          color="#e9e9e9"
        />
      </View>

      {showEmoji && (
        <EmojiSelector
          height={300}
          onEmojiSelected={(emoji) => setMessage((prevMsg) => prevMsg + emoji)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default DirectMessageScreen;
