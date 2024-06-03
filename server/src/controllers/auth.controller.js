import UserModel from "../models/User.model.js";
import { genToken } from "../utils/genToken.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";

export const me = async (req, res, next) => {
  const uid = req.user._id;

  if (!isValidObjectId(uid)) {
    throw createHttpError(400, "Invalid User ID");
  }

  const user = await UserModel.findById(uid);
  if (!user) {
    throw createHttpError(
      404,
      "There was an error while fetching the user details"
    );
  }

  res.status(200).json(user);
};

export const signup = async (req, res, next) => {
  try {
    const { username, fullName, email, password } = req.body;
    if (!username || !fullName || !email || !password) {
      throw createHttpError(400, "Enter valid credentials to signup.");
    }

    const emailRegEx = /[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/;
    if (!emailRegEx.test(email)) {
      throw createHttpError(400, "Enter a valid email");
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
      throw createHttpError(400, "There was an error while creating the user");
    }

    genToken(user._id, res);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw createHttpError(400, "Enter valid credentials");
    }

    const user = await UserModel.findOne({ username })
      .select("+password")
      .exec();
    if (!user) {
      throw createHttpError(404, "Invalid credentials. User does not exist.");
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw createHttpError(400, "Invalid login credentials.");
    }

    genToken(user._id, res);

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({ Message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
