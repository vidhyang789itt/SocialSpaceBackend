import Conversations from "../Models/Conversations";
import Messages from "../Models/Messages";
import mongoose, { Types } from "mongoose";
import User from "../Models/Users";
import fs from "fs";
import path from "path";
import { isUserFollowing } from "../Utils/user";

const isIdEqual = (id1: any, id2: any): boolean => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};

export interface PopulatedUser {
  _id: Types.ObjectId;
  userId: string;
  username: string;
  profileUrl?: string;
}

export interface PopulatedMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: PopulatedUser | Types.ObjectId;
  receiverId: PopulatedUser | Types.ObjectId | null;
  content: string;
  media: any[];
  messageType: string;
  readBy?: any[];
  isRead?: boolean;
  isDeletedForAll?: boolean;
  originalContent?: string;
  deletedForMe?: Array<{ userId: Types.ObjectId }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedConversation {
  _id: Types.ObjectId;
  type: "direct" | "group";
  user1?: PopulatedUser;
  user2?: PopulatedUser;
  groupName?: string;
  groupImage?: string;
  groupAdmin?: PopulatedUser;
  groupMembers?: Array<{
    userId: PopulatedUser;
    role: "admin" | "member";
  }>;
  groupUnreadCounts?: Array<{
    _id: Types.ObjectId;
    unreadCount: number;
  }>;
  lastMessage?: string;
  lastMessageSender?: Types.ObjectId;
  lastMessageTime?: Date;
  unreadCountUser1?: number;
  unreadCountUser2?: number;
  updatedAt: Date;
}

export interface ReplyData {
  messageId: string;
  content: string;
  senderName: string;
  media?: Array<{
    url: string;
    type: "image" | "video" | "file";
  }>;
}

export const createOrGetConversation = async (
  userId1: string,
  userId2: string
): Promise<PopulatedConversation> => {
  try {
    const userA = await User.findOne({ userId: userId1 }).select("_id");
    const userB = await User.findOne({ userId: userId2 }).select("_id");

    if (!userA || !userB) {
      throw new Error("User not found");
    }

    const [id1, id2] =
      userA._id.toString() < userB._id.toString()
        ? [userA._id, userB._id]
        : [userB._id, userA._id];

    let conversation = await Conversations.findOne({
      type: "direct",
      user1: id1,
      user2: id2,
    }).populate("user1 user2", "username profileUrl userId");

    if (!conversation) {
      const newConversation = await Conversations.create({
        type: "direct",
        user1: id1,
        user2: id2,
      });

      conversation = await newConversation.populate(
        "user1 user2",
        "username profileUrl userId"
      );
    }

    return conversation as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error creating/getting conversation:", error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string | null,
  content: string,
  media?: any[],
  replyTo?: ReplyData
): Promise<PopulatedMessage> => {
  try {
    const sender = await User.findOne({ userId: senderId });
    if (!sender) throw new Error("User not found");


    const conversation = await Conversations.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.type === "direct" && receiverId) {
      const isFollowing = await isUserFollowing(senderId, receiverId);
      if (!isFollowing) {
        const error = new Error("You must follow this user to send messages") as any;
        error.statusCode = 403;
        throw error;
      }
    }

    let messageType = "text";
    if (media && media.length > 0) {
      if (content && content.trim()) {
        messageType = "mixed";
      } else {
        messageType = media[0].type;
      }
    }

    const messageData: any = {
      conversationId,
      senderId: sender._id,
      receiverId: receiverId
        ? (await User.findOne({ userId: receiverId }))?._id
        : null,
      content,
      media: media || [],
      messageType,
    };

    if (replyTo && replyTo.messageId) {
      messageData.replyTo = {
        messageId: new mongoose.Types.ObjectId(replyTo.messageId),
        content: replyTo.content,
        senderName: replyTo.senderName,
        media: replyTo.media || [],
      };
    }

    const message = await Messages.create(messageData);

    conversation.lastMessage = content || `[${messageType.toUpperCase()}]`;
    conversation.lastMessageSender = sender._id;
    conversation.lastMessageTime = new Date();

    if (conversation.type === "direct") {
      if (isIdEqual(conversation.user1, sender._id)) {
        conversation.unreadCountUser2 =
          (conversation.unreadCountUser2 || 0) + 1;
      } else {
        conversation.unreadCountUser1 =
          (conversation.unreadCountUser1 || 0) + 1;
      }
    } else if (conversation.type === "group" && conversation.groupUnreadCounts) {
      const updatedCounts = conversation.groupUnreadCounts.map((item: any) => {
        if (item && item._id && !isIdEqual(item._id, sender._id)) {
          return {
            _id: item._id,
            unreadCount: (item.unreadCount || 0) + 1,
          };
        }
        return {
          _id: item?._id,
          unreadCount: item?.unreadCount || 0,
        };
      });

      conversation.groupUnreadCounts = updatedCounts as any;
    }

    await conversation.save();

    const populatedMessage = await message.populate(
      "senderId receiverId",
      "username profileUrl userId"
    );

    return populatedMessage as unknown as PopulatedMessage;
  } catch (error) {
    console.error("❌ Error saving message:", error);
    throw error;
  }
};

export const getUserConversations = async (
  userId: string
): Promise<PopulatedConversation[]> => {
  try {
    const user = await User.findOne({ userId }).select("_id");

    if (!user) {
      throw new Error("User not found");
    }

    const conversations = await Conversations.find({
      $or: [
        { type: "direct", user1: user._id },
        { type: "direct", user2: user._id },
        { "groupMembers.userId": user._id },
      ],
    })
      .sort({ updatedAt: -1 })
      .populate("user1 user2 groupAdmin", "username profileUrl userId followers")
      .populate("groupMembers.userId", "username profileUrl userId");


    return conversations as unknown as PopulatedConversation[];
  } catch (error) {
    console.error("❌ Error fetching conversations:", error);
    throw error;
  }
};

export const getConversationById = async (
  conversationId: string
): Promise<PopulatedConversation | null> => {
  try {

    const conversation = await Conversations.findById(conversationId)
      .populate("user1 user2 groupAdmin", "username profileUrl userId")
      .populate("groupMembers.userId", "username profileUrl userId");

    if (!conversation) {
      console.warn("⚠️ Conversation not found:", conversationId);
      return null;
    }

    return conversation as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error fetching conversation:", error);
    throw error;
  }
};

export const markAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {

    const conversation = await Conversations.findById(conversationId);
    const user = await User.findById(userId);


    if (!conversation) throw new Error("Conversation not found");
    if (!user) throw new Error("User not found");

    if (conversation.type === "direct") {
      await Messages.updateMany(
        {
          conversationId: conversation._id,
          receiverId: user._id,
          isRead: false,
        },
        { $set: { isRead: true } }
      );

      if (isIdEqual(user._id, conversation.user1)) {
        conversation.unreadCountUser1 = 0;
      } else {
        conversation.unreadCountUser2 = 0;
      }

    } else if (conversation.type === "group" && conversation.groupUnreadCounts) {
      await Messages.updateMany(
        {
          conversationId: conversation._id,
          senderId: { $ne: user._id },
        },
        {
          $addToSet: {
            readBy: {
              userId: user._id,
              readAt: new Date(),
            },
          },
        }
      );

      const updatedCounts = conversation.groupUnreadCounts.map((item: any) => {
        if (item && item._id && isIdEqual(item._id, user._id)) {
          return {
            _id: item._id,
            unreadCount: 0,
          };
        }
        return {
          _id: item?._id,
          unreadCount: item?.unreadCount || 0,
        };
      });

      conversation.groupUnreadCounts = updatedCounts as any;
    }

    await conversation.save();
  } catch (error) {
    console.error("❌ Error marking as read:", error);
    throw error;
  }
};

export const getUnreadChatCount = async (
  userId: string,
  isOriginal: boolean
): Promise<{ totalUnread: number; userId: string }> => {
  try {
    const user = isOriginal
      ? await User.findById(userId).select("_id userId")
      : await User.findOne({ userId }).select("_id userId");

    if (!user) {
      throw new Error("User not found");
    }

    const mongoUserId = new mongoose.Types.ObjectId(user._id);

    const result = await Conversations.aggregate([
      {
        $match: {
          $or: [
            {
              type: "direct",
              user1: mongoUserId,
              unreadCountUser1: { $gt: 0 },
            },

            {
              type: "direct",
              user2: mongoUserId,
              unreadCountUser2: { $gt: 0 },
            },

            {
              type: "group",
              groupUnreadCounts: {
                $elemMatch: {
                  _id: mongoUserId,
                  unreadCount: { $gt: 0 },
                },
              },
            },
          ],
        },
      },

      {
        $group: {
          _id: "$_id",
        },
      },

      {
        $count: "totalUnreadConversations",
      },
    ]);

    const totalUnread = result?.[0]?.totalUnreadConversations || 0;


    return {
      totalUnread,
      userId: user.userId,
    };
  } catch (error) {
    console.error("❌ Error fetching unread chat count:", error);
    throw error;
  }
};

export const createGroupChat = async (
  groupName: string,
  memberUserIds?: string | string[],
  groupImage?: string,
  adminUserId?: string
) => {
  try {
    const adminId = adminUserId;
    if (!adminId) throw new Error("Admin user ID is required");

    const admin = await User.findOne({ userId: adminId });
    if (!admin) throw new Error("Admin user not found");

    let allMemberIds: string[] = [];

    if (memberUserIds) {
      allMemberIds = Array.isArray(memberUserIds)
        ? memberUserIds
        : [memberUserIds];
    }

    const uniqueMemberIds = Array.from(
      new Set([adminId, ...allMemberIds])
    );

    const members = await User.find({ userId: { $in: uniqueMemberIds } });

    if (members.length === 0) throw new Error("No valid members found");

    const groupMembersData = members.map((member) => ({
      userId: member._id,
      role: isIdEqual(member._id, admin._id)
        ? ("admin" as const)
        : ("member" as const),
    }));

    const groupUnreadCountsData = groupMembersData.map((member) => ({
      _id: member.userId,
      unreadCount: 0,
    }));


    const conversation = await Conversations.create({
      type: "group",
      groupName,
      groupImage: groupImage || undefined,
      groupAdmin: admin._id,
      groupMembers: groupMembersData,
      groupUnreadCounts: groupUnreadCountsData,
      updatedAt: new Date(),
    });


    const populated = await conversation.populate([
      { path: "groupAdmin", select: "username profileUrl userId" },
      { path: "groupMembers.userId", select: "username profileUrl userId" },
      { path: "groupUnreadCounts._id", select: "username profileUrl userId" },
    ]);

    return populated as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error creating group chat:", error);
    throw error;
  }
};

export const addGroupMember = async (
  groupId: string,
  newUserIds: string | string[],
  requesterUserId: string
) => {
  try {
    const conversation = await Conversations.findById(groupId);
    if (!conversation || conversation.type !== "group") {
      throw new Error("Group not found");
    }

    const requester = await User.findOne({ userId: requesterUserId });
    if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
      throw new Error("Only group admin can add members");
    }

    const userIdsArray = Array.isArray(newUserIds) ? newUserIds : [newUserIds];
    const newUsers = await User.find({ userId: { $in: userIdsArray } });

    if (newUsers.length === 0) throw new Error("No valid users found");

    newUsers.forEach((user) => {
      const isMember =
        conversation.groupMembers &&
        conversation.groupMembers.some(
          (m: any) => m && m.userId && isIdEqual(m.userId, user._id)
        );

      if (!isMember) {
        conversation.groupMembers?.push({
          userId: user._id,
          role: "member" as const,
        } as any);

        conversation.groupUnreadCounts?.push({
          _id: user._id,
          unreadCount: 0,
        } as any);
      }
    });

    await conversation.save();

    return (await conversation.populate(
      "groupAdmin groupMembers.userId",
      "username profileUrl userId"
    )) as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error adding members:", error);
    throw error;
  }
};

export const removeGroupMember = async (
  groupId: string,
  memberUserIdToRemove: string,
  requesterUserId: string
) => {
  try {

    const conversation = await Conversations.findById(groupId);
    if (!conversation || conversation.type !== "group") {
      throw new Error("Group not found");
    }

    const requester = await User.findOne({ userId: requesterUserId });
    if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
      throw new Error("Only group admin can remove members");
    }

    const memberToRemove = await User.findOne({
      userId: memberUserIdToRemove,
    });
    if (!memberToRemove) throw new Error("User not found");

    if (conversation.groupMembers && Array.isArray(conversation.groupMembers)) {
      const filteredMembers = conversation.groupMembers.filter(
        (m: any) =>
          !m || !m.userId || !isIdEqual(m.userId, memberToRemove._id)
      );
      conversation.groupMembers = filteredMembers as any;
    }

    if (
      conversation.groupUnreadCounts &&
      Array.isArray(conversation.groupUnreadCounts)
    ) {
      const filteredCounts = conversation.groupUnreadCounts.filter(
        (c: any) =>
          !c || !c._id || !isIdEqual(c._id, memberToRemove._id)
      );
      conversation.groupUnreadCounts = filteredCounts as any;
    }

    await conversation.save();


    return (await conversation.populate(
      "groupAdmin groupMembers.userId",
      "username profileUrl userId"
    )) as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error removing member:", error);
    throw error;
  }
};

export const leaveGroup = async (
  groupId: string,
  userIdToRemove: string
): Promise<PopulatedConversation> => {
  try {

    const conversation = await Conversations.findById(groupId);
    if (!conversation || conversation.type !== "group") {
      throw new Error("Group not found");
    }

    const user = await User.findOne({ userId: userIdToRemove });
    if (!user) throw new Error("User not found");

    if (conversation.groupMembers && Array.isArray(conversation.groupMembers)) {
      const filteredMembers = conversation.groupMembers.filter(
        (m: any) => !m || !m.userId || !isIdEqual(m.userId, user._id)
      );
      conversation.groupMembers = filteredMembers as any;
    }

    if (
      conversation.groupUnreadCounts &&
      Array.isArray(conversation.groupUnreadCounts)
    ) {
      const filteredCounts = conversation.groupUnreadCounts.filter(
        (c: any) => !c || !c._id || !isIdEqual(c._id, user._id)
      );
      conversation.groupUnreadCounts = filteredCounts as any;
    }

    await conversation.save();

    return (await conversation.populate(
      "groupAdmin groupMembers.userId",
      "username profileUrl userId"
    )) as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error leaving group:", error);
    throw error;
  }
};

export const updateGroupInfo = async (
  groupId: string,
  groupName: string | undefined,
  requesterUserId: string
): Promise<PopulatedConversation> => {
  try {

    const conversation = await Conversations.findById(groupId);
    if (!conversation || conversation.type !== "group") {
      throw new Error("Group not found");
    }

    const requester = await User.findOne({ userId: requesterUserId });
    if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
      throw new Error("Only group admin can update group info");
    }

    if (groupName) conversation.groupName = groupName;

    await conversation.save();

    return (await conversation.populate(
      "groupAdmin groupMembers.userId",
      "username profileUrl userId"
    )) as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error updating group info:", error);
    throw error;
  }
};

export const updateGroupImage = async (
  groupId: string,
  imagePath: string,
  requesterUserId: string
): Promise<PopulatedConversation> => {
  try {
    const conversation = await Conversations.findById(groupId);

    if (!conversation || conversation.type !== "group") {
      throw new Error("Group not found");
    }

    const requester = await User.findOne({ userId: requesterUserId });

    if (!requester || !isIdEqual(conversation.groupAdmin, requester._id)) {
      throw new Error("Only group admin can update group info");
    }

    const oldImageUrl = conversation.groupImage;
    conversation.groupImage = imagePath;



    if (oldImageUrl) {
      try {
        const fullPath = path.join(__dirname, oldImageUrl);
        await fs.promises.unlink(fullPath);
      } catch (err: any) {
      }
    }

    await conversation.save();

    return (await conversation.populate(
      "groupAdmin groupMembers.userId",
      "username profileUrl userId"
    )) as unknown as PopulatedConversation;
  } catch (error) {
    console.error("❌ Error updating group info:", error);
    throw error;
  }
};

export const deleteGroup = async (
  groupId: string,
  requesterUserId: string
): Promise<boolean> => {
  const conversation = await Conversations.findById(groupId);

  if (!conversation || conversation.type !== "group") {
    throw new Error("Group not found or is not a group conversation");
  }

  const result = await Conversations.findByIdAndDelete(groupId);

  return !!result;
};

export const deleteMessageForMe = async (
  messageId: string,
  userId: string
): Promise<PopulatedMessage> => {
  try {
    const user = await User.findOne({ userId }).select("_id");
    if (!user) throw new Error("User not found");

    const message = await Messages.findById(messageId);
    if (!message) throw new Error("Message not found");

    const alreadyDeleted = message.deletedForMe?.some((item) =>
      isIdEqual(item.userId, user._id)
    );

    if (alreadyDeleted) {
      throw new Error("Message already deleted for you");
    }

    if (!message.deletedForMe) message.deletedForMe = [] as any;
    message.deletedForMe.push({
      userId: user._id,
    } as any);

    await message.save();

    return (await message.populate(
      "senderId receiverId",
      "username profileUrl userId"
    )) as unknown as PopulatedMessage;
  } catch (error) {
    console.error("❌ Error deleting message for me:", error);
    throw error;
  }
};

export const deleteMessageForAll = async (
  messageId: string,
  userId: string
): Promise<PopulatedMessage> => {
  try {
    const user = await User.findOne({ userId }).select("_id");
    if (!user) throw new Error("User not found");

    const message = await Messages.findById(messageId);
    if (!message) throw new Error("Message not found");

    if (!isIdEqual(message.senderId, user._id)) {
      const error = new Error(
        "Only message sender can delete for everyone"
      ) as any;
      error.statusCode = 403;
      throw error;
    }

    const messageAge = Date.now() - message.createdAt.getTime();
    const fifteenMinutes = 15 * 60 * 1000;

    if (messageAge > fifteenMinutes) {
      const error = new Error(
        "Can only delete messages sent within last 15 minutes"
      ) as any;
      error.statusCode = 400;
      throw error;
    }

    message.originalContent = message.content;
    message.isDeletedForAll = true;
    message.content = "";
    message.media = [] as any;
    message.messageType = "text";

    await message.save();

    return (await message.populate(
      "senderId receiverId",
      "username profileUrl userId"
    )) as unknown as PopulatedMessage;
  } catch (error) {
    console.error("❌ Error deleting message for all:", error);
    throw error;
  }
};

interface PaginatedMessages {
  messages: PopulatedMessage[];
  totalMessages: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const getMessages = async (
  conversationId: string,
  userId?: string,
  page: number = 1,
  limit: number = 50
): Promise<PaginatedMessages> => {
  try {
    let user = null;
    if (userId) {
      user = await User.findOne({ userId }).select("_id");
    }

    const skip = (page - 1) * limit;

    const totalMessages = await Messages.countDocuments({ conversationId });

    const messages = await Messages.find({ conversationId })
      .populate("senderId receiverId", "username profileUrl userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const sortedMessages = messages.reverse();

    if (!user) {
      return {
        messages: sortedMessages as unknown as PopulatedMessage[],
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: page,
        hasNextPage: skip + limit < totalMessages,
        hasPreviousPage: page > 1,
      };
    }

    const filteredMessages = messages
      .map((msg) => {
        const isDeletedForUser = msg.deletedForMe?.some((item) =>
          isIdEqual(item.userId, user!._id)
        );

        if (isDeletedForUser) {
          return null;
        }

        return msg;
      })
      .filter((msg) => msg !== null);

    return {
      messages: filteredMessages as unknown as PopulatedMessage[],
      totalMessages,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      hasNextPage: skip + limit < totalMessages,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    throw error;
  }
};