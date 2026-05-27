
import { Server } from 'socket.io';
import { NotificationType } from '../Types/Notification.types';
import { createNotification } from '../Services/notificationService';


interface NotificationData {
  recipientId: string;
  senderId: string;
  type: NotificationType;
  content?: string;
  referenceId?: string;
}

export const sendNotification = async (
  io: Server, 
  onlineUsers: Map<string, string>, 
  data: NotificationData
): Promise<void> => {
  try {
    const{ notification : populatedNotify} = await createNotification(data);

    if (!populatedNotify) return;

    io.to(data.recipientId).emit("newNotification", populatedNotify);
  } catch (error) {
    console.error("Notification Socket Handler Error:", error);
  }
};