import mongoose from "mongoose";

type IFComments = {
  text: string;
  user: mongoose.Schema.Types.ObjectId;
};

type PostSchemaType = {
  user: mongoose.Schema.Types.ObjectId;
  text?: string;
  img?: string;
  likes?: mongoose.Schema.Types.ObjectId[];
  comments?: IFComments[];
  _id: mongoose.Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
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
