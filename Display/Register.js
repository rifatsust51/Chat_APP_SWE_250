import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const { width } = useWindowDimensions();

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
    return regex.test(password);
  };

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  function registerHandler() {
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Missing fields", "All fields are required.");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Password Mismatch", "Passwords do not match.");
    }

    if (!validatePassword(password)) {
      return Alert.alert(
        "Weak Password",
        "Password must have at least:\n- 1 uppercase letter\n- 1 lowercase letter\n- 1 special character\n- Minimum 8 characters"
      );
    }

    if (!image) {
      return Alert.alert("Image Required", "Please select a profile image.");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    const uriParts = image.split("/");
    const fileName = uriParts[uriParts.length - 1];
    const fileType = fileName.split(".").pop();

    formData.append("image", {
      uri: image,
      name: fileName,
      type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
    });

    axios
      .post("http://192.168.0.102:8000/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        Alert.alert("Success", "You have been registered successfully");
        setName("");
        setImage(null);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      })
      .catch((e) => {
        console.log(e);
        Alert.alert("Error", "There was an error during registration.");
      });
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create a New Account</Text>
          </View>
          <View style={styles.formContainer}>
            <Input
              title="Name"
              placeholder="Enter your name"
              stateManager={setName}
              value={name}
            />
            <Input
              title="Email"
              placeholder="Enter your email"
              stateManager={setEmail}
              value={email}
            />
            <Input
              title="Password"
              placeholder="Enter your password"
              stateManager={setPassword}
              value={password}
              isSecure={true}
            />
            <Input
              title="Confirm Password"
              placeholder="Re-enter your password"
              stateManager={setConfirmPassword}
              value={confirmPassword}
              isSecure={true}
            />
            <Button onPress={pickImage}>Pick Profile Image</Button>
            {image && (
              <Image
                source={{ uri: image }}
                style={[
                  styles.profileImage,
                  {
                    width: width * 0.3,
                    height: width * 0.3,
                    borderRadius: (width * 0.3) / 2,
                  },
                ]}
              />
            )}
            <Button onPress={registerHandler}>Register</Button>
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.replace("LoginScreen")}>
                <Text style={styles.loginLink}>Sign-in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: "5%",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  headerContainer: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A55A2",
  },
  subtitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "600",
  },
  formContainer: {
    marginTop: 15,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  profileImage: {
    marginVertical: 10,
    alignSelf: "center",
    resizeMode: "cover",
  },
  loginRow: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: "gray",
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    color: "#4A55A2",
  },
});
