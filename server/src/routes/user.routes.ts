import express from "express";
import * as userController from "../controllers/user.controllers";
import { authProtected } from "../middlewares/authProtected";

const userRouter = express.Router();

userRouter.get("/profile", authProtected, userController.profile);
userRouter.get("/suggested", authProtected, userController.suggested);
userRouter.post("/follow/:fid", authProtected, userController.followUnfollow);
userRouter.patch("/update", authProtected, userController.updateProfile);

export default userRouter;
