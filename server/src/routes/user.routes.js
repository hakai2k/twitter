import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authProtected } from "../middlewares/authProtected.js";

const userRouter = express.Router();

userRouter.get("/profile", authProtected, userController.profile);
userRouter.get("/suggested", authProtected, userController.suggested);
userRouter.post("/follow/:fid", authProtected, userController.followUnfollow);
userRouter.post("/update", authProtected, userController.updateProfile);

export default userRouter;
