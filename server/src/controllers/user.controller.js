import createHttpError from "http-errors";
import UserModel from "../models/User.model.js";
import { isValidObjectId } from "mongoose";

export const profile = async (req, res, next) => {
  try {
    const uid = req.user._id;
    if (!isValidObjectId(uid)) {
      throw createHttpError(400, "Invalid User ID");
    }

    const user = await UserModel.findById(uid);
    if (!user) {
      throw createHttpError(
        404,
        "There was an error while retreiving the user details."
      );
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const followUnfollow = async (req, res, next) => {
  try {
    const fid = req.params.fid;
    if (!isValidObjectId(fid)) {
      throw createHttpError(400, "Invalid Friend ID");
    }

    const uid = req.user._id;
    if (!isValidObjectId(uid)) {
      throw createHttpError(400, "Invalid User ID");
    }

    const friend = await UserModel.findById(fid);
    if (!friend) {
      throw createHttpError(
        404,
        "There was an error while retreiving the user details."
      );
    }

    const user = await UserModel.findById(uid);
    if (!user) {
      throw createHttpError(
        404,
        "There was an error while retreiving the user details."
      );
    }
  } catch (error) {
    next(error);
  }
};
