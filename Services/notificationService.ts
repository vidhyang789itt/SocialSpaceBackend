import Notification from "../Models/Notifications";
import Post from "../Models/Posts";
import User from "../Models/Users";
import { NotificationType } from "../Types/Notification.types";

async function getAllNotification(userId: string) {
  try {
    const user = await User.findOne({ userId }, "_id");
    if (!user) throw new Error("USER not found");

    return await Notification.find({ recipient: user._id })
      .populate('sender', 'username profileUrl userId')
      .populate('referenceId', 'title postId imageUrl content username profileUrl')
      .sort({ createdAt: -1 });
  } catch (err) {
    throw err;
  }
}

async function markAsRead(userId: string) {
  try {
    const user = await User.findOne({ userId }, "_id");
    if (!user) throw new Error("USER not found");
    
    await Notification.updateMany({ recipient: user._id, isRead: false }, { isRead: true });
  } catch (err) {
    throw err;
  }
}

interface CreateNotificationDTO {
  recipientId: string;
  senderId: string;    
  type: NotificationType;
  content?: string;
  referenceId?: string; 
}

export const createNotification = async (data: CreateNotificationDTO) => {
  try {
    const recipient = await User.findOne({ userId: data.recipientId });
    if (!recipient) throw new Error("Recipient not found");

    let referenceDocId = null;
    let onModel = "";

    if (data.type === NotificationType.FOLLOW) {
      referenceDocId = data.senderId; 
      onModel = "User";
    } else {
      const post = await Post.findOne({ postId: data.referenceId });
      if (!post) throw new Error("Post not found");
      
      referenceDocId = post._id;
      onModel = "Post";
    }
    

    const newNotification = new Notification({
      recipient: recipient._id,
      sender: data.senderId,
      type: data.type,
      content: data.content,
      referenceId: referenceDocId,
      onModel: onModel 
    });

    await newNotification.save();

    const populatedNotification = await Notification.findById(newNotification._id)
      .populate('sender', 'username profileUrl userId')
      .populate('referenceId'); 

    return { notification: populatedNotification };
  } catch (error) {
    throw error;
  }
};

export const markNotificationRead = async (notificationId: string, userId : string) => {
    const notification = await Notification.findById(notificationId);
    const user = await User.findOne({userId});
    

    if (!notification) {
      throw new Error("Notification not found");
    }

    if(!user){
      throw new Error("user not found");
    }

    notification.isRead = true;
    await notification.save();

    const updatedNotification = await Notification.findById(notificationId)
      .populate('sender', 'username profileUrl userId')
      .populate('referenceId', 'title _id postId imageUrl content');

    return updatedNotification;
}

export { getAllNotification, markAsRead };