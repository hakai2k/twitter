import createHttpError from "http-errors";
import env from "../utils/validateEnv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import UserModel from "../models/User.model";
import { RequestHandler } from "express";

export const authProtected: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw createHttpError(400, "Unauthorized: No token found.");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const uid = decoded.uid;

    if (!isValidObjectId(uid)) {
      throw createHttpError(400, "Invalid User ID");
    }

    const user = await UserModel.findById(uid);
    if (!user) {
      throw createHttpError(
        404,
        "There was an error while retrieving the user."
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
