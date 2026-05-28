import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    content: {
      type: String,
      trim: true,
    },

    media: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "file"],
        },
        fileName: String,
        fileSize: Number,
      },
    ],

    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "mixed"],
      default: "text",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    deletedBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isDeletedForAll: {
      type: Boolean,
      default: false,
    },

    originalContent: {
      type: String,
      trim: true,
    },

    deletedForMe: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    replyTo: {
      messageId: {
        type: Schema.Types.ObjectId,
        ref: "Messages",
      },
      content: String,
      senderName: String,
      media: [
        {
          url: String,
          type: {
            type: String,
            enum: ["image", "video", "file"],
          },
        },
      ],
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Messages", messageSchema);

export default Message;