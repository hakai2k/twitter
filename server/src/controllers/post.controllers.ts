import PostModel, { IF_UserType } from "../models/Post.model";
import NotificationModel from "../models/Notification.model";
import UserModel from "../models/User.model";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { Types, isValidObjectId } from "mongoose";
import { RequestHandler } from "express";

interface IF_CreatePostBody {
  text?: string;
  img?: string;
}
export const createPost: RequestHandler<
  unknown,
  unknown,
  IF_CreatePostBody,
  unknown
> = async (req, res, next) => {
  try {
    const text = req.body.text;
    let img = req.body.img;
    if (!text && !img) {
      throw createHttpError(400, "A post must have a text or image");
    }

    const user = req.user;
    if (!user) {
      throw createHttpError(
        400,
        "There was an error while retrieving the user"
      );
    }

    if (img) {
      const uploadedImageResponse = await cloudinary.uploader.upload(img);
      img = uploadedImageResponse.secure_url;
    }

    const newPost = await PostModel.create({
      user: user._id,
      text,
      img,
    });
    if (!newPost) {
      throw createHttpError(400, "There was an error while creating the post");
    }

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (!isValidObjectId(postId)) {
      throw createHttpError(400, "Invalid Post ID");
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      throw createHttpError(404, "Post not found");
    }

    if (post.user.toString() !== req.user._id.toString()) {
      throw createHttpError(
        400,
        "Unauthorized: You are not authorized to delete this post."
      );
    }

    if (post.img) {
      const imgIdParts = post.img.split("/");
      const imgId =
        imgIdParts.length > 0 ? imgIdParts.pop()?.split(".")[0] : undefined;

      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }

    const deletedPost = await PostModel.findByIdAndDelete(postId);
    if (!deletedPost) {
      throw createHttpError(400, "There was an error while deleting the post.");
    }

    res.status(200).json({ Message: "Post deleted successfully." });
  } catch (error) {
    next(error);
  }
};

interface IF_CommentBody {
  text?: string;
}
interface IF_CommentParams {
  postId?: Types.ObjectId;
}
export const comment: RequestHandler<
  IF_CommentParams,
  unknown,
  IF_CommentBody,
  unknown
> = async (req, res, next) => {
  try {
    const { text } = req.body;
    const uid = req.user._id;
    const { postId } = req.params;
    if (!text) {
      throw createHttpError(
        400,
        "You need to enter some text to post a comment."
      );
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      throw createHttpError(404, "Post not found.");
    }

    const comment = {
      user: uid,
      text,
    };

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const like: RequestHandler = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const postId = req.params.postId;

    const post = await PostModel.findById(postId).populate("user");
    if (!post) {
      throw createHttpError(404, "Post not found");
    }

    const userLikedPost = post.likes.includes(uid);
    if (userLikedPost) {
      await PostModel.findByIdAndUpdate(postId, { $pull: { likes: uid } });
      await UserModel.findByIdAndUpdate(uid, { $pull: { likedPosts: postId } });

      res.status(200).json({ Message: "Post unliked successfully" });
    } else {
      post.likes.push(uid);
      await post.save();
      await UserModel.findByIdAndUpdate(uid, { $push: { likedPosts: postId } });

      const likedPostNotification = await NotificationModel.create({
        from: uid,
        to: (post.user as IF_UserType)._id, // Type assertion here
        type: "like",
      });
      if (!likedPostNotification) {
        throw createHttpError(
          400,
          "There was an error while creating a notification"
        );
      }

      res.status(200).json({
        Message: "Post liked successfully",
        Notification: likedPostNotification,
        post,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllPosts: RequestHandler = async (req, res, next) => {
  try {
    const allPosts = await PostModel.find({})
      .sort({ createdAt: -1 })
      .populate("user")
      .populate({
        path: "comments.user",
      });
    if (allPosts.length == 0) {
      res.status(200).json([]);
    }

    res.status(200).json(allPosts);
  } catch (error) {
    next(error);
  }
};

export const getLikedPosts: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw createHttpError(404, "Error while fetching the user details.");
    }

    const likedPosts = await PostModel.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
      })
      .populate({
        path: "comments.user",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    next(error);
  }
};

export const getFollowingPosts: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;

    const following = user.following;

    const feedPosts = await PostModel.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
      })
      .populate({
        path: "comments.user",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getUserPosts: RequestHandler = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw createHttpError(404, "user does not exist.");
    }

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
      })
      .populate({
        path: "comments.user",
      });

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
