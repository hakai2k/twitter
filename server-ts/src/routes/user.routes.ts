import express from "express";
import * as userController from "../controllers/user.controller";
import { authProtectedRoute } from "../middlewares/authProtectedRoute";

const userRouter = express.Router();

userRouter.get("/profile", authProtectedRoute, userController.profile);
userRouter.post(
  "/follow/:fid",
  authProtectedRoute,
  userController.followUnfollow
);
userRouter.get("/suggested", authProtectedRoute, userController.suggested);
userRouter.post("/update", authProtectedRoute, userController.update);

export default userRouter;
