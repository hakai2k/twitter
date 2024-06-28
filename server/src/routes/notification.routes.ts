import express from "express";
import * as notificationController from "../controllers/notification.controllers";
import { authProtected } from "../middlewares/authProtected";

const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  authProtected,
  notificationController.getNotifications
);
notificationRouter.delete(
  "/",
  authProtected,
  notificationController.deleteAllNotification
);
notificationRouter.delete(
  "/:notificationId",
  authProtected,
  notificationController.deleteNotification
);

export default notificationRouter;
