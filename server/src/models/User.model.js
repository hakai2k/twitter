import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter your fullname."],
    },
    username: {
      type: String,
      required: [true, "Please choose a username."],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter an email."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password."],
      min: 8,
      max: 32,
      select: false,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("user", UserSchema);
