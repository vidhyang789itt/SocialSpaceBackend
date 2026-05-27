import mongoose, { Schema } from "mongoose";
import { NotificationType } from "../Types/Notification.types";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    content : {
      type: String,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      required: true, 
      refPath: 'onModel' 
    },

    onModel: {
      type: String,
      required: true,
      enum: ['Post', 'User'] 
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notifications", notificationSchema);
export default Notification;
