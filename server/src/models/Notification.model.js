import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
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

export default mongoose.model("notification", NotificationSchema);
