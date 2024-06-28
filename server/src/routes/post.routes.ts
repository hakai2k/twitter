import express from "express";
import * as postController from "../controllers/post.controllers";
import { authProtected } from "../middlewares/authProtected";

const postRouter = express.Router();

postRouter.get("/", authProtected, postController.getAllPosts);
postRouter.get("/following", authProtected, postController.getFollowingPosts);
postRouter.get("/user/:username", authProtected, postController.getUserPosts);
postRouter.post("/create", authProtected, postController.createPost);
postRouter.post("/like/:postId", authProtected, postController.like);
postRouter.get("/liked", authProtected, postController.getLikedPosts);
postRouter.post("/comment/:postId", authProtected, postController.comment);
postRouter.delete("/delete/:postId", authProtected, postController.deletePost);

export default postRouter;
