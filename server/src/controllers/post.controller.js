import PostModel from "../models/Post.model.js";
import NotificationModel from "../models/Notification.model.js";
import UserModel from "../models/User.model.js";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { isValidObjectId } from "mongoose";

export const createPost = async (req, res, next) => {
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

export const deletePost = async (req, res, next) => {
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
        "Unauthorized: You are not authrorized to delete this post."
      );
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
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

export const comment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const uid = req.user._id;
    const postId = req.params.postId;
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

export const like = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const postId = req.params.postId;

    const post = await PostModel.findById(postId);
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
        to: post.user._id,
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

export const getAllPosts = async (req, res, next) => {
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

export const getLikedPosts = async (req, res, next) => {
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
