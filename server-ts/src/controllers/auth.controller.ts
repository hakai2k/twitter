import UserModel from "../models/User.model";
import { genToken } from "../utils/genToken";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

interface SignUpBody {
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
}
export const signup: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  try {
    const { fullName, email, username, password } = req.body;
    if (!fullName || !email || !username || !password) {
      throw createHttpError(400, "Enter all user info to signup.");
    }

    const emailRegEx: RegExp =
      /[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/;
    if (!emailRegEx.test(email)) {
      throw createHttpError(400, "Enter a valid email.");
    }

    const existingUserName = await UserModel.findOne({ username });
    if (existingUserName) {
      throw createHttpError(
        400,
        "A user with this username already exists. Choose a different username or login instead."
      );
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      throw createHttpError(
        400,
        "A user with this email already exists. Enter a different email or login instead."
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      fullName,
      username,
      email,
      password: passwordHash,
    });
    if (!user) {
      throw createHttpError(400, "There was an error while creating the user.");
    }

    genToken(user._id, res);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

interface LoginBody {
  username?: string;
  password?: string;
}
export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw createHttpError(400, "Enter all the credentials to login.");
    }

    const user = await UserModel.findOne({ username }).select("+password");
    if (!user) {
      throw createHttpError(404, "Invalid credentials.");
    }

    const isPasswordMatching: boolean = await bcrypt.compare(
      password,
      user.password
    );
    if (!isPasswordMatching) {
      throw createHttpError(400, "Invalid credentials");
    }

    genToken(user._id, res);

    user.password = "";
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ Message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
