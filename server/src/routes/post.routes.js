import express from "express";
import * as postController from "../controllers/post.controller.js";
import { authProtected } from "../middlewares/authProtected.js";

const postRouter = express.Router();

postRouter.get("/", authProtected, postController.getAllPosts);
postRouter.post("/create", authProtected, postController.createPost);
postRouter.post("/like/:postId", authProtected, postController.like);
postRouter.post("/liked/", authProtected, postController.getLikedPosts);
postRouter.post("/comment/:postId", authProtected, postController.comment);
postRouter.delete("/delete/:postId", authProtected, postController.deletePost);

export default postRouter;
