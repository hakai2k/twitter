import express from "express";
import * as authController from "../controllers/auth.controllers";
import { authProtected } from "../middlewares/authProtected";

const authRouter = express.Router();

authRouter.get("/me", authProtected, authController.me);
authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);

export default authRouter;
