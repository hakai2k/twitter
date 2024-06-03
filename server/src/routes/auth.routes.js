import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authProtected } from "../middlewares/authProtected.js";

const authRouter = express.Router();

authRouter.get("/me", authProtected, authController.me);
authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);

export default authRouter;
