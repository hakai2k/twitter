import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import UserModel from "../models/User.model.js";
import NotificationModel from "../models/Notification.model.js";
import { isValidObjectId } from "mongoose";
import bcrypt from "bcrypt";

export const profile = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const followUnfollow = async (req, res, next) => {
  try {
    const { fid } = req.params;
    if (!isValidObjectId(fid)) {
      throw createHttpError(400, "Invalid Friend ID");
    }

    const friend = await UserModel.findById(fid);
    if (!friend) {
      throw createHttpError(
        404,
        "There was an error while retreiving the user details."
      );
    }

    const user = req.user;

    if (friend._id.toString() === user._id.toString()) {
      throw createHttpError(400, "You cannot follow/unfollow yourself.");
    }

    const isFollowing = user.following.includes(friend._id);
    if (isFollowing) {
      await UserModel.findByIdAndUpdate(friend._id, {
        $pull: { followers: user._id },
      });
      await UserModel.findByIdAndUpdate(user._id, {
        $pull: { following: friend._id },
      });

      res.status(200).json({ Message: "User unfollowed successfully" });
    } else {
      await UserModel.findByIdAndUpdate(friend._id, {
        $push: { followers: user._id },
      });
      await UserModel.findByIdAndUpdate(user._id, {
        $push: { following: friend._id },
      });

      const newNotification = await NotificationModel.create({
        type: "follow",
        from: user._id,
        to: friend._id,
      });
      if (!newNotification) {
        throw createHttpError(
          400,
          "There was an error while creating notification"
        );
      }

      res.status(200).json({
        Message: "User followed successfully",
        Notification: newNotification,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const suggested = async (req, res, next) => {
  try {
    const user = req.user;
    const users = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: user._id },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !user.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    let { profileImg, coverImg } = req.body;

    const uid = req.user._id;

    let user = await UserModel.findById(uid);
    if (!user) {
      throw createHttpError(404, "User not found.");
    }

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      throw createHttpError(
        400,
        "Please provide both current password and new password."
      );
    }

    if (currentPassword && newPassword) {
      const isPasswordMatching = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordMatching) {
        throw createHttpError(400, "Current password is incorrect.");
      }

      if (newPassword.length < 6) {
        throw createHttpError(
          400,
          "Password must be atleast 6 characters or long."
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedProfileImgResponse = await cloudinary.uploader.upload(
        profileImg
      );
      profileImg = uploadedProfileImgResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedCoverImgResponse = await cloudinary.uploader.upload(
        coverImg
      );
      coverImg = uploadedCoverImgResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    if (!user) {
      throw createHttpError(
        400,
        "There was an error while updating the user details."
      );
    }

    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
