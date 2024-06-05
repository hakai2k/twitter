import { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../utils/validateEnv";
import UserModel from "../models/User.model";

export const authProtectedRoute: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw createHttpError(400, "Unauthorized: Token not found.");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!decoded) {
      throw createHttpError(400, "Unauthorized: Invalid token.");
    }

    const uid = decoded.uid;
    const user = await UserModel.findById(uid);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
