import { Response, NextFunction } from "express";
import { CustomRequest } from "../Types/CustomRequestType";
import * as postsService from "../Services/PostService";

async function getUserFeed(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? "1");
    const limit = parseInt((req.query.limit as string) ?? "10");

    if (!req.user) throw new Error("Unauthorized");

    const result = await postsService.getAllPosts(req.user.userId, page, limit);

    res.status(200).json({
      success: true,
      body: result.posts,
      pagination: {
        totalPosts: result.totalPosts,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createPost(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let { title, content } = req.body;


    if (!title && req.body.title) {
      title = req.body.title;
    }
    if (!content && req.body.content) {
      content = req.body.content;
    }

    if (!title || !content) {
      const error = new Error("title and content should not be empty") as any;
      error.statusCode = 400;
      return next(error);
    }

    if (!req.user) throw new Error("Unauthorized");

    const mediaFiles = (req.files as Express.Multer.File[]) || [];

    const newPost = await postsService.createPost(
      title,
      content,
      req.user.userId,
      mediaFiles.length > 0 ? mediaFiles : undefined,
    );

    res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (err) {
    next(err);
  }
}

async function updatePost(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.params.id) {
      const { title, content } = req.body;

      if (!title || !content) {
        const error = new Error("title and content should not be empty") as any;
        error.statusCode = 400;
        return next(error);
      }

      const updatedPost = await postsService.updatePost(req.params.id, {
        title,
        content,
      });

      res.status(200).json({
        success: true,
        data: updatedPost,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function deletePost(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.params.id) {
      await postsService.deletePost(req.params.id);

      res.status(200).json({
        success: true,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function getPost(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    if (req.params.postId) {
      const post = await postsService.getPost(req.params.postId);

      return res.status(200).json({
        success: true,
        data: post,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function updatePostMedia(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.params.id) {
      const mediaFiles = (req.files as Express.Multer.File[]) || [];
      let { removeMediaIds } = req.body;

      if (removeMediaIds && typeof removeMediaIds === "string") {
        try {
          removeMediaIds = JSON.parse(removeMediaIds);
        } catch (e) {
          console.error("Failed to parse removeMediaIds:", e);
        }
      }

      if (mediaFiles.length === 0 && !removeMediaIds) {
        const error = new Error(
          "Media files or removeMediaIds must be provided",
        ) as any;
        error.statusCode = 400;
        return next(error);
      }

      const updatedPost = await postsService.updatePostMedia(
        req.params.id,
        mediaFiles.length > 0 ? mediaFiles : [],
        removeMediaIds,
      );

      res.status(200).json({
        success: true,
        data: updatedPost,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function getUserAllPost(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.params.userId) {
      const posts = await postsService.getUsersPost(req.params.userId);

      res.status(200).json({
        success: true,
        body: posts,
      });
    }
  } catch (err) {
    next(err);
  }
}

export {
  getUserFeed,
  createPost,
  updatePost,
  deletePost,
  getPost,
  updatePostMedia,
  getUserAllPost,
};