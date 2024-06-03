import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authProtected } from "../middlewares/authProtected.js";

const userRouter = express.Router();

userRouter.get("/profile", authProtected, userController.profile);
userRouter.get("/follow/:fid", authProtected, userController.followUnfollow);
userRouter.get("/suggested", authProtected, userController.suggested);

export default userRouter;
