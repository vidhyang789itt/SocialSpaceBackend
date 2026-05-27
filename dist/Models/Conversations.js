"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["direct", "group"],
        default: "direct",
    },
    user1: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    user2: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    lastMessage: {
        type: String,
        trim: true,
    },
    lastMessageSender: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User",
            },
            unreadCount: {
                type: Number,
                default: 0,
            },
        },
    ],
}, {
    timestamps: true,
});
conversationSchema.index({ user1: 1, user2: 1, type: 1 }, {
    unique: true,
    sparse: true,
    partialFilterExpression: { type: "direct" }
});
const Conversation = mongoose_1.default.model("Conversations", conversationSchema);
exports.default = Conversation;
