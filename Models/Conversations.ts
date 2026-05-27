import mongoose, { Schema } from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    user1: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    user2: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    groupName: {
      type: String,
      trim: true,
    },

    groupImage: {
      type: String,
    },

    groupMembers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    lastMessage: {
      type: String,
      trim: true,
    },

    lastMessageSender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    lastMessageTime: {
      type: Date,
    },

    unreadCountUser1: {
      type: Number,
      default: 0,
    },

    unreadCountUser2: {
      type: Number,
      default: 0,
    },

    groupUnreadCounts: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        unreadCount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

conversationSchema.index(
  { user1: 1, user2: 1, type: 1 },
  { 
    unique: true, 
    sparse: true, 
    partialFilterExpression: { type: "direct" } 
  }
);

const Conversation = mongoose.model("Conversations", conversationSchema);

export default Conversation;