import mongoose from "mongoose";

type NotificationSchemaType = {
  _id: mongoose.Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  to: mongoose.Schema.Types.ObjectId;
  from: mongoose.Schema.Types.ObjectId;
  type: string;
  read: boolean;
};

const NotificationSchema = new mongoose.Schema<NotificationSchemaType>(
  {
    type: {
      type: String,
      required: [true, "Title is required for notification."],
      enum: ["follow", "like", "comment"],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    from: {
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
