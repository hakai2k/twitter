import mongoose from "mongoose";

type UserSchemaType = {
  _id: mongoose.Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  followers: mongoose.Schema.Types.ObjectId[];
  following: mongoose.Schema.Types.ObjectId[];
  bio: string;
  link: string;
  profileImg: string;
  coverImg: string;
  likedPosts: mongoose.Schema.Types.ObjectId[];
};
const UserSchema = new mongoose.Schema<UserSchemaType>(
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

type UserModel = mongoose.InferSchemaType<typeof UserSchema>;
export default mongoose.model<UserModel>("user", UserSchema);
