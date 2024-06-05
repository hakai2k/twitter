import { RequestHandler } from "express-serve-static-core";
import mongoose, { isValidObjectId } from "mongoose";
import UserModel from "../models/User.model";
import createHttpError from "http-errors";
import NotificationModel from "../models/Notification.model";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

export const profile: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

interface IF_Follow {
  fid?: mongoose.Schema.Types.ObjectId;
}
export const followUnfollow: RequestHandler<
  IF_Follow,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const friend = await UserModel.findById(req.params.fid);
    if (!friend) {
      throw createHttpError(404, "Friend not found");
    }

    const user = req.user;

    if (friend._id.toString() === user._id.toString()) {
      throw createHttpError(400, "You cannot follow/unfollow yourself");
    }

    const isFollowing = user.following.includes(friend._id);
    if (isFollowing) {
      await UserModel.findByIdAndUpdate(friend._id, {
        $pull: { followers: user._id },
      });
      await UserModel.findByIdAndUpdate(user._id, {
        $pull: { following: friend._id },
      });

      res.status(200).json({ Message: "User unfollowed successfully." });
    } else {
      await UserModel.findByIdAndUpdate(friend._id, {
        $push: { followers: user._id },
      });
      await UserModel.findByIdAndUpdate(user._id, {
        $push: { following: friend._id },
      });

      const newFollowNotification = await NotificationModel.create({
        type: "follow",
        from: user._id,
        to: friend._id,
      });
      if (!newFollowNotification) {
        throw createHttpError(
          400,
          "There was an error while creating notification"
        );
      }

      res.status(201).json({
        Message: "User followed successfully",
        Notification: newFollowNotification,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const suggested: RequestHandler = async (req, res, next) => {
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

interface IF_UpdateUserBody {
  fullName?: string;
  email?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
  bio?: string;
  link?: string;
  profileImg?: string;
  coverImg?: string;
}
export const update: RequestHandler<
  unknown,
  unknown,
  IF_UpdateUserBody,
  unknown
> = async (req, res, next) => {
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

    let user = await UserModel.findById(uid).select("+password");
    if (!user) {
      throw createHttpError(
        404,
        "There was an error while retreiving user details."
      );
    }

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      throw createHttpError(
        400,
        "Please provide both current and new password"
      );
    }

    if (currentPassword && newPassword) {
      const isPasswordMatching = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordMatching) {
        throw createHttpError(400, "Current password is incorrect");
      }

      if (newPassword.length < 6) {
        throw createHttpError(
          400,
          "Password must be atleast 6 characters or longer."
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        const profileImgID = user.profileImg.split("/").pop()?.split(".")[0];
        if (profileImgID) {
          await cloudinary.uploader.destroy(profileImgID);
        }

        const uploadedProfileImgResponse = await cloudinary.uploader.upload(
          profileImg
        );
        profileImg = uploadedProfileImgResponse.secure_url;
      }
    }

    if (coverImg) {
      if (user.coverImg) {
        const coverImgID = user.coverImg.split("/").pop()?.split(".")[0];
        if (coverImgID) {
          await cloudinary.uploader.destroy(coverImgID);
        }

        const uploadedCoverImgResponse = await cloudinary.uploader.upload(
          coverImg
        );
        coverImg = uploadedCoverImgResponse.secure_url;
      }
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
        "There was an error while updating user details."
      );
    }

    user.password = "null";

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
