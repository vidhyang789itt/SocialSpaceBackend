import Post from "../Models/Posts";
import User from "../Models/Users";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

interface MediaFile {
  type: "image" | "video";
  url: string;
  filename: string;
}

async function createPost(
  title: string,
  content: string,
  userId: string,
  mediaFiles?: Express.Multer.File[],
) {
  const user = await User.findOne({ userId });

  if (!user) {
    const error: any = new Error("Cannot find user");
    error.statusCode = 400;
    throw error;
  }

  const media: MediaFile[] = [];

  if (mediaFiles && mediaFiles.length > 0) {
    for (const file of mediaFiles) {
      const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
      media.push({
        type: fileType,
        url: file.path,
        filename: file.filename,
      });
    }
  }

  const newPost = await Post.create({
    postId: uuidv4(),
    author: user._id,
    title: title,
    content: content,
    media: media,
    imageUrl: media.length > 0 && media[0].type === "image" ? media[0].url : undefined,
  });

  return newPost.populate("author");
}

async function getAllPosts(
  userId: string,
  page: number = 1,
  limit: number = 10,
) {
  const user = await User.findOne({ userId }, "_id following");

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const authorIds = [...user.following, user._id];

  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    Post.find({ author: { $in: authorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author"),
    Post.countDocuments({ author: { $in: authorIds } }),
  ]);

  return {
    posts,
    totalPosts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
  };
}

async function updatePost(
  postId: string,
  updates: {
    title?: string;
    content?: string;
  },
) {
  const post = await Post.findOne({ postId });

  if (!post) {
    const error: any = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  if (updates.title) post.title = updates.title;
  if (updates.content) post.content = updates.content;

  await post.save();
  return post.populate("author");
}

async function deletePost(postId: string) {
  const post = await Post.findOne({ postId });

  if (!post) {
    const error: any = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  if (post.media && post.media.length > 0) {
    for (const media of post.media) {
      try {
        await cloudinary.uploader.destroy(media.filename, { resource_type: media.type });
      } catch (err) {
        console.error(`Failed to delete media file from cloudinary: ${media.filename}`, err);
      }
    }
  }

  await Post.findOneAndDelete({ postId });

  return true;
}

async function getPost(postId: string) {
  const post = await Post.findOne({ postId }).populate("author");

  if (!post) {
    const error: any = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }
  return post;
}

async function updatePostMedia(
  postId: string,
  mediaFiles: Express.Multer.File[],
  removeMediaIds?: string[],
) {
  const post = await Post.findOne({ postId });

  if (!post) {
    const error: any = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  if (removeMediaIds && removeMediaIds.length > 0) {
    for (const mediaId of removeMediaIds) {
      const mediaIndex = post.media.findIndex(
        (m: any) => m._id.toString() === mediaId
      );

      if (mediaIndex !== -1) {
        const mediaItem = post.media[mediaIndex];
        try {
          await cloudinary.uploader.destroy(mediaItem.filename, { resource_type: mediaItem.type });
        } catch (err) {
          console.error(`Failed to delete media file from cloudinary: ${mediaItem.filename}`, err);
        }
        post.media.splice(mediaIndex, 1);
      }
    }
  }

  if (mediaFiles && mediaFiles.length > 0) {
    for (const file of mediaFiles) {
      const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
      post.media.push({
        type: fileType,
        url: file.path,
        filename: file.filename,
      } as any);
    }
  }

  if (post.media.length > 0) {
    const firstImageOrVideo = post.media.find(
      (m: any) => m.type === "image"
    ) || post.media[0];
    post.imageUrl = firstImageOrVideo.url;
  } else {
    post.imageUrl = undefined;
  }

  await post.save();
  return post.populate("author");
}

async function getUsersPost(userId: string) {
  const user = await User.findOne({ userId });

  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .populate("author");

  return posts;
}

export {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  getPost,
  updatePostMedia,
  getUsersPost,
};