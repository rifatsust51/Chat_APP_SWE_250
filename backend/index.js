// // Importing dependencies
// import bodyParser from "body-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import http from "http";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";
// import multer from "multer";
// import passport from "passport";
// import path from "path";
// import { Server } from "socket.io";

// import Message from "./models/message.js";
// import User from "./models/user.js";

// const __dirname = path.resolve();

// // Initializing App
// const app = express();

// // Environment variable setup
// dotenv.config({ path: ".env" });
// const port = 8000;

// // Setting up middlewares
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(passport.initialize());

// // Connecting with the Database
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("\nConnected to MongoDB"))
//   .catch((err) => console.log("MongoDB connection error: ", err));

// // --- SOCKET.IO SETUP ---
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// // Store mapping of socket.id to userId
// const onlineUsers = new Map();

// io.on("connection", (socket) => {
//   // Listen for user-online event from client
//   socket.on("user-online", async (userId) => {
//     onlineUsers.set(socket.id, userId);
//     socket.data.userId = userId;
//     await User.findByIdAndUpdate(userId, { online: true });
//     io.emit("update-online-status", { userId, online: true });
//   });

//   socket.on("disconnect", async () => {
//     const userId = socket.data.userId || onlineUsers.get(socket.id);
//     if (userId) {
//       await User.findByIdAndUpdate(userId, { online: false });
//       io.emit("update-online-status", { userId, online: false });
//       onlineUsers.delete(socket.id);
//     }
//   });
// });

// // Multer setup for profile image uploads
// const profileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "files/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });
// const profileUpload = multer({ storage: profileStorage });

// // Signup (with image upload)
// app.post("/register", profileUpload.single("image"), (req, res) => {
//   const { name, email, password } = req.body;
//   const image = req.file ? req.file.filename : null;
//   if (!email || !name || !password) {
//     return res.status(404).json({
//       message: "All fields are required",
//     });
//   }

//   // Check if user already exists with this email
//   User.findOne({ email }).then((user) => {
//     if (user) {
//       return res.status(400).json({
//         message: "User already exist with this email.",
//       });
//     }

//     // Create a new user
//     const newUser = new User({ name, email, password, image });
//     newUser
//       .save()
//       .then(() => {
//         return res.status(200).json({
//           message: "User registered.",
//           success: true,
//         });
//       })
//       .catch((e) => {
//         console.log("User registration error : ", e);
//         return res
//           .status(500)
//           .json({ message: "Error in registration.", success: false });
//       });
//   });
// });

// function createToken(userID) {
//   const payload = {
//     userID: userID,
//   };

//   const token = jwt.sign(payload, "lskdjoii5473iiiiiiiiii76iiiiirj34", {
//     expiresIn: "365d",
//   });
//   return token;
// }

// // Login
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(404).json({
//       message: "Invalid credentials",
//     });
//   }
//   User.findOne({ email })
//     .then((user) => {
//       if (!user) {
//         // User not found
//         return res.status(404).json({
//           message: "User not found",
//         });
//       }

//       // Comparing passwords
//       if (user.password !== password) {
//         return res.status(404).json({
//           message: "Invalid password",
//         });
//       }

//       const token = createToken(user._id);
//       return res.status(200).json({ token });
//     })
//     .catch((e) => {
//       console.log("Error in finding user e : ", e);
//       res.status(500).json({
//         message: "Internal server error",
//       });
//     });
// });

// // Get other users (INCLUDE ONLINE FIELD)
// app.get("/users/:userID", async (req, res) => {
//   const loggedInUserID = req.params.userID;

//   await User.find({ _id: { $ne: loggedInUserID } }, "name email image online")
//     .then((users) => {
//       res.status(200).json({ users });
//     })
//     .catch((e) => {
//       console.log(e);
//       res.status(500).json({
//         message: "Error retrieving users",
//       });
//     });
// });

// // Sending Friend Requests
// app.post("/friend-request", async (req, res) => {
//   const { currentUserID, selectedUserID } = req.body;
//   try {
//     // Update sender's sent requests array
//     await User.findByIdAndUpdate(currentUserID, {
//       $addToSet: { sentFriendRequests: selectedUserID },
//     });
//     // Update receiver's received request array
//     await User.findByIdAndUpdate(selectedUserID, {
//       $addToSet: { friendRequests: currentUserID },
//     });

//     return res.status(200).json({ message: "Request sent", success: true });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Accept Friend Request
// app.post("/friend-request/accept", async (req, res) => {
//   const { currentUserID, selectedUserID } = req.body;
//   try {
//     // Finding users
//     const sender = await User.findById(currentUserID);
//     const receiver = await User.findById(selectedUserID);

//     // Adding friends
//     await User.findByIdAndUpdate(sender._id, {
//       $addToSet: { friends: selectedUserID },
//     });

//     // Push currentUserID into receiver's friends if it doesn't already exist
//     await User.findByIdAndUpdate(receiver._id, {
//       $addToSet: { friends: currentUserID },
//     });

//     receiver.friendRequests = receiver.friendRequests.filter(
//       (request) => request._id.toString() !== currentUserID.toString()
//     );
//     sender.sentFriendRequests = sender.sentFriendRequests.filter(
//       (request) => request._id.toString() !== selectedUserID.toString()
//     );

//     await sender.save();
//     await receiver.save();
//     return res.status(200).json({ message: "Request accepted", success: true });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Show all friend requests
// app.get("/requests/:userID", async (req, res) => {
//   try {
//     const userID = req.params.userID;

//     const user = await User.findById(userID)
//       .populate("friendRequests", "name email image online")
//       .lean();
//     const friendRequests = user.friendRequests;
//     res.status(200).json({ friendRequests, success: true });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Utility: Reset all friend/friend request arrays (not exposed as endpoint)
// // eslint-disable-next-line no-unused-vars
// async function reset() {
//   const all = await User.find();
//   await all.forEach((element) => {
//     element.friends = [];
//     element.friendRequests = [];
//     element.sentFriendRequests = [];
//     element.save();
//   });
// }
// // reset();

// // Get all friends of the logged in user (INCLUDE ONLINE FIELD)
// app.get("/all-friends/:userID", async (req, res) => {
//   try {
//     const { userID } = req.params;
//     const user = await User.findById(userID).populate(
//       "friends",
//       "name email image online"
//     );
//     const allFriends = user.friends;

//     return res.status(200).json({ allFriends, success: true });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Post messages (with image upload)
// const messageStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "files/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });
// const messageUpload = multer({ storage: messageStorage });

// app.post("/messages", messageUpload.single("imageFile"), async (req, res) => {
//   try {
//     const { senderID, receiverID, messageType, message } = req.body;
//     console.log("req.file is :", req.file);
//     console.log("req.body is :", req.body);
//     const imageURL =
//       messageType === "image" && req.file
//         ? `/files/${req.file.filename.replace(/\\/g, "/")}`
//         : null;
//     const newMessage = new Message({
//       senderID,
//       receiverID,
//       messageType,
//       message,
//       timeStamp: new Date(),
//       imageURL: imageURL,
//     });
//     console.log("imageURL is:", newMessage.imageURL);
//     await newMessage.save();
//     const populatedMessage = await Message.findById(newMessage._id).populate(
//       "senderID",
//       "_id name"
//     );
//     return res.status(200).json({
//       success: true,
//       message: populatedMessage,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Get user details for DM (INCLUDE ONLINE FIELD)
// app.get("/user/:userID", async (req, res) => {
//   try {
//     const userID = req.params.userID;

//     const user = await User.findById(userID, "name email image online");

//     return res.status(200).json({
//       success: true,
//       user: user,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Get conversation
// app.get("/messages/:senderID/:receiverID", async (req, res) => {
//   try {
//     const senderID = req.params.senderID;
//     const receiverID = req.params.receiverID;

//     const messages = await Message.find({
//       $or: [
//         {
//           senderID: senderID,
//           receiverID: receiverID,
//         },
//         {
//           senderID: receiverID,
//           receiverID: senderID,
//         },
//       ],
//     }).populate("senderID", "_id name");

//     return res.status(200).json({
//       success: true,
//       messages: messages,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Get user's sent friend requests (INCLUDE ONLINE FIELD)
// app.get("/sent-requests/:userID", async (req, res) => {
//   try {
//     const { userID } = req.params;
//     const sentRequests = await User.findById(userID).populate(
//       "sentFriendRequests",
//       "_id name online"
//     );
//     return res.status(200).json({
//       success: true,
//       sentRequests: sentRequests.sentFriendRequests,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Some error", success: false });
//   }
// });

// // Serve static files (profile images, message images, etc.)
// app.use("/files", express.static(path.join(__dirname, "files")));
// app.get("/files", (req, res) => {
//   const imagePath = path.join(
//     __dirname,
//     "files",
//     "721055916441-781746627-image.jpg"
//   );
//   res.sendFile(imagePath);
// });

// // Start server with socket.io
// server.listen(port, () => console.log(`\nServer started at ${port}`));

// Importing dependencies
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import passport from "passport";
import path from "path";
import { Server } from "socket.io";

import Message from "./models/message.js";
import User from "./models/user.js";

const __dirname = path.resolve();

// Initializing App
const app = express();

// Environment variable setup
dotenv.config({ path: ".env" });
const port = 8000;

// Setting up middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Connecting with the Database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("\nConnected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store mapping of socket.id to userId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  // Listen for user-online event from client
  socket.on("user-online", async (userId) => {
    onlineUsers.set(socket.id, userId);
    socket.data.userId = userId;
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("update-online-status", { userId, online: true });
  });

  socket.on("disconnect", async () => {
    const userId = socket.data.userId || onlineUsers.get(socket.id);
    if (userId) {
      await User.findByIdAndUpdate(userId, { online: false });
      io.emit("update-online-status", { userId, online: false });
      onlineUsers.delete(socket.id);
    }
  });
});

// Multer setup for profile image uploads
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const profileUpload = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

// Signup (with image upload)
app.post("/register", profileUpload.single("image"), async (req, res) => {
  const { name, email, password } = req.body;
  const image = req.file ? req.file.filename : null;
  console.log(image);

  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error in registration",
    });
  }
});

function createToken(userID) {
  const payload = {
    userID: userID,
  };

  const token = jwt.sign(payload, "lskdjoii5473iiiiiiiiii76iiiiirj34", {
    expiresIn: "365d",
  });
  return token;
}

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = createToken(user._id);
    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get other users (INCLUDE ONLINE FIELD)
app.get("/users/:userID", async (req, res) => {
  const loggedInUserID = req.params.userID;

  try {
    const users = await User.find(
      { _id: { $ne: loggedInUserID } },
      "name email image online"
    );
    res.status(200).json({
      success: true,
      users,
    });
  } catch (e) {
    console.error("Error retrieving users:", e);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
    });
  }
});

// Sending Friend Requests
app.post("/friend-request", async (req, res) => {
  const { currentUserID, selectedUserID } = req.body;
  try {
    // Update sender's sent requests array
    await User.findByIdAndUpdate(currentUserID, {
      $addToSet: { sentFriendRequests: selectedUserID },
    });
    // Update receiver's received request array
    await User.findByIdAndUpdate(selectedUserID, {
      $addToSet: { friendRequests: currentUserID },
    });

    return res.status(200).json({
      success: true,
      message: "Request sent",
    });
  } catch (error) {
    console.error("Friend request error:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending friend request",
    });
  }
});

// Accept Friend Request
app.post("/friend-request/accept", async (req, res) => {
  const { currentUserID, selectedUserID } = req.body;
  try {
    // Finding users
    const sender = await User.findById(currentUserID);
    const receiver = await User.findById(selectedUserID);

    // Adding friends
    await User.findByIdAndUpdate(sender._id, {
      $addToSet: { friends: selectedUserID },
    });

    // Push currentUserID into receiver's friends if it doesn't already exist
    await User.findByIdAndUpdate(receiver._id, {
      $addToSet: { friends: currentUserID },
    });

    receiver.friendRequests = receiver.friendRequests.filter(
      (request) => request._id.toString() !== currentUserID.toString()
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request._id.toString() !== selectedUserID.toString()
    );

    await sender.save();
    await receiver.save();
    return res.status(200).json({
      success: true,
      message: "Request accepted",
    });
  } catch (error) {
    console.error("Accept friend request error:", error);
    return res.status(500).json({
      success: false,
      message: "Error accepting friend request",
    });
  }
});

// Show all friend requests
app.get("/requests/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;

    const user = await User.findById(userID)
      .populate("friendRequests", "name email image online")
      .lean();
    const friendRequests = user.friendRequests;
    res.status(200).json({
      success: true,
      friendRequests,
    });
  } catch (error) {
    console.error("Get friend requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting friend requests",
    });
  }
});

// Utility: Reset all friend/friend request arrays (not exposed as endpoint)
// eslint-disable-next-line no-unused-vars
async function reset() {
  const all = await User.find();
  await all.forEach((element) => {
    element.friends = [];
    element.friendRequests = [];
    element.sentFriendRequests = [];
    element.save();
  });
}
// reset();

// Get all friends of the logged in user (INCLUDE ONLINE FIELD)
app.get("/all-friends/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID).populate(
      "friends",
      "name email image online"
    );
    const allFriends = user.friends;

    return res.status(200).json({
      success: true,
      allFriends,
    });
  } catch (error) {
    console.error("Get friends error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting friends",
    });
  }
});

// Post messages (with image upload)
const messageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const messageUpload = multer({
  storage: messageStorage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

app.post("/messages", messageUpload.single("imageFile"), async (req, res) => {
  try {
    const { senderID, receiverID, messageType, message } = req.body;
    console.log("req.file is :", req.file);
    console.log("req.body is :", req.body);
    const imageURL =
      messageType === "image" && req.file
        ? `/files/${req.file.filename.replace(/\\/g, "/")}`
        : null;
    const newMessage = new Message({
      senderID,
      receiverID,
      messageType,
      message,
      timeStamp: new Date(),
      imageURL: imageURL,
    });
    console.log("imageURL is:", newMessage.imageURL);
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderID",
      "_id name"
    );
    return res.status(200).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Message send error:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending message",
    });
  }
});

// Get user details for DM (INCLUDE ONLINE FIELD)
app.get("/user/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;

    const user = await User.findById(userID, "name email image online");

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting user",
    });
  }
});

// Get conversation
app.get("/messages/:senderID/:receiverID", async (req, res) => {
  try {
    const senderID = req.params.senderID;
    const receiverID = req.params.receiverID;

    const messages = await Message.find({
      $or: [
        {
          senderID: senderID,
          receiverID: receiverID,
        },
        {
          senderID: receiverID,
          receiverID: senderID,
        },
      ],
    }).populate("senderID", "_id name");

    return res.status(200).json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting messages",
    });
  }
});

// Get user's sent friend requests (INCLUDE ONLINE FIELD)
app.get("/sent-requests/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const sentRequests = await User.findById(userID).populate(
      "sentFriendRequests",
      "_id name online"
    );
    return res.status(200).json({
      success: true,
      sentRequests: sentRequests.sentFriendRequests,
    });
  } catch (error) {
    console.error("Get sent requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting sent requests",
    });
  }
});

// Serve static files (profile images, message images, etc.)
app.use("/files", express.static(path.join(__dirname, "files")));
app.get("/files", (req, res) => {
  const imagePath = path.join(
    __dirname,
    "files",
    "721055916441-781746627-image.jpg"
  );
  res.sendFile(imagePath);
});

// Start server with socket.io
server.listen(port, () => console.log(`\nServer started at ${port}`));
