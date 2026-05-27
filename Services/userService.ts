import User from "../Models/Users";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import * as postsService from "./PostService";

export async function getUserProfile(userId: string) {
  const user = await User.findOne({ userId });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  updates: { username?: string; email?: string },
) {
  const user = await User.findOne({ userId });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (updates.username) user.username = updates.username;
  if (updates.email) user.email = updates.email;

  await user.save();

  return user;
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await User.findOne({ userId });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    const error: any = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();

  return true;
}

export async function getUserConnections(
  userId: string,
  type: "followers" | "following",
) {
  const user = await User.findOne({ userId }).populate(type);

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user[type];
}

export async function updateProfilePhoto(
  userId: string,
  imagePath: string,
) {
  const user = await User.findOne({ userId });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const oldImageUrl = user.profileUrl;

  user.profileUrl = imagePath;

  if (oldImageUrl) {
    try {
      const fullPath = path.join(__dirname, oldImageUrl);
      await fs.promises.unlink(fullPath);
    } catch (err: any) {
    }
  }

  await user.save();

  return user;
}

export async function getAllUsers() {
  const users = await User.find({});

  return users;
}



export const getUserFullProfileData = async (userId: string) => {
  const [userStats, posts, followers, following] = await Promise.all([
    getUserProfile(userId),                  
    postsService.getAllPosts(userId),        
    getUserConnections(userId, "followers"), 
    getUserConnections(userId, "following")
  ]);

  return {
    user: userStats,
    posts: posts.posts, 
    followers: followers,
    following: following
  };
};