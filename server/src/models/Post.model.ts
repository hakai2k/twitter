import mongoose, { mongo } from "mongoose";

export type IF_UserType = {
  _id: mongoose.Schema.Types.ObjectId;
  // Add other user fields if necessary
};

type IF_CommentsType = {
  text: string;
  user: mongoose.Schema.Types.ObjectId;
};

type PostSchemaType = {
  _id: mongoose.Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  user: mongoose.Schema.Types.ObjectId | IF_UserType; // Adjusted to account for populated user
  text?: string;
  img?: string;
  likes: mongoose.Schema.Types.ObjectId[];
  comments: IF_CommentsType[];
};
const PostSchema = new mongoose.Schema<PostSchemaType>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
  },
  { timestamps: true }
);

type PostModel = mongoose.InferSchemaType<typeof PostSchema>;
export default mongoose.model<PostModel>("post", PostSchema);
