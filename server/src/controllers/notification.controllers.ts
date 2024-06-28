import { RequestHandler } from "express";
import NotificationModel from "../models/Notification.model";
import createHttpError from "http-errors";
import { Types } from "mongoose";

export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const uid = req.user._id;

    const notifications = await NotificationModel.find({ to: uid }).populate({
      path: "from",
      select: "username profileImg",
    });

    await NotificationModel.updateMany({ to: uid }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotification: RequestHandler = async (req, res, next) => {
  try {
    const uid = req.user._id;
    await NotificationModel.deleteMany({ to: uid });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification: RequestHandler = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const uid = req.user._id;
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw createHttpError(
        400,
        "there was an error while deleting the notification."
      );
    }

    if (notification.to.toString() !== uid.toString()) {
      throw createHttpError(
        400,
        "Unauthorized: You are not authorized to delete this notification."
      );
    }

    await NotificationModel.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};
