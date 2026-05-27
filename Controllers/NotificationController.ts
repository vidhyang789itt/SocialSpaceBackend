import { Response, NextFunction } from "express";
import { CustomRequest } from "../Types/CustomRequestType";
import * as notificationService from "../Services/notificationService"

async function getAllNotification(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;

    if(!userId){
        const error = new Error("User not found") as any;
        error.statusCode = 400;
        return next(error);
    }

    const notifications = await notificationService.getAllNotification(userId);
    

    res.json(notifications);
  } catch (err: any) {
    next(err);
  }
}

async function markAsRead(req: CustomRequest, res: Response, next : NextFunction){
    try{
        const userId = req.user?.userId;

        if(!userId){
            const error = new Error("User not found") as any;
            error.statusCode = 400;
            return next(error);
        }

        await notificationService.markAsRead(userId);
        res.json({ success: true });
    }
    catch(err){
        next(err);
    }
};

async function markNotificationRead(req: CustomRequest, res: Response, next: NextFunction){
  try {
    const { notificationId } = req.params;
    const userId = req.user?.userId;

    if(!notificationId || !userId){
        throw new Error("resource not found");
    }

    const updatedNotification = notificationService.markNotificationRead(notificationId, userId);

    res.json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

export {
    getAllNotification,
    markAsRead,
    markNotificationRead
}