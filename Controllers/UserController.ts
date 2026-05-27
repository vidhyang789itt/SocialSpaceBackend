import { Response, NextFunction } from "express";
import { CustomRequest } from "../Types/CustomRequestType";
import * as userService from "../Services/userService";

async function getProfile(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new Error("Unauthorized");

    const user = await userService.getUserProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new Error("Unauthorized");

    const updatedUser = await userService.updateUserProfile(
      req.user.userId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}

async function updatePassword(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new Error("Unauthorized");
    const { currentPassword, newPassword } = req.body;

    await userService.updatePassword(req.user.userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

async function getUserConnections(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new Error("Unauthorized");
    const { type } = req.params;

    if (!type || !["followers", "following"].includes(type)) {
      const error = new Error("Invalid connection type") as any;
      error.statusCode = 400;
      return next(error);
    }

    const users = await userService.getUserConnections(
      req.user.userId,
      type as "followers" | "following",
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

async function getSpecificUserProfile(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      const error = new Error("User ID is required") as any;
      error.statusCode = 400;
      return next(error);
    }

    const user = await userService.getUserProfile(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function addProfileImage(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new Error("Unauthorized");

    if (!req.file) {
      const error = new Error("No file uploaded") as any;
      error.statusCode = 400;
      return next(error);
    }

    const imagePath = `../uploads/${req.file.filename}`;

    const user = await userService.updateProfilePhoto(req.user.userId, imagePath);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(
  _req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

async function getFullUserProfile(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.id ?? req.user?.userId;

    if (!userId) {
      const error = new Error("User ID is required") as any;
      error.statusCode = 400;
      return next(error);
    }

    const profileData = await userService.getUserFullProfileData(userId);

    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (err) {
    next(err);
  }
}


export {
  getProfile,
  updateProfile,
  updatePassword,
  getUserConnections,
  getSpecificUserProfile,
  addProfileImage,
  getAllUsers,
};
