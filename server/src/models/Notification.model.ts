import mongoose from "mongoose";

type NotificationSchemaType = {
  _id: mongoose.Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  type: "follow" | "like" | "comment";
  from: mongoose.Schema.Types.ObjectId;
  to: mongoose.Schema.Types.ObjectId;
  read: boolean;
};
const NotificationSchema = new mongoose.Schema<NotificationSchemaType>(
  {
    type: {
      type: String,
      required: [true, "Title is required for notification"],
      enum: ["follow", "like", "comment"],
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

type NotificationModel = mongoose.InferSchemaType<typeof NotificationSchema>;
export default mongoose.model<NotificationModel>(
  "notification",
  NotificationSchema
);
