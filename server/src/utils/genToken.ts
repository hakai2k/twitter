import { Response } from "express";
import env from "./validateEnv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const genToken = (
  uid: mongoose.Schema.Types.ObjectId,
  res: Response
) => {
  const token = jwt.sign({ uid }, env.JWT_SECRET, { expiresIn: "15d" });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
    httpOnly: true,
    secure: env.NODE_ENV !== "development",
  });
};
