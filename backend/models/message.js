import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiverID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messageType: {
    type: String,
    enum: ["text", "image"],
  },
  message: String,
  imageURL: String,
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
