import app from "./app";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import env from "./utils/validateEnv";

mongoose.connect(env.MONGO_CONN).then(() => {
  app.listen(env.PORT, () => {
    console.log(`Server is running on ${env.PORT}`);
  });

  cloudinary.config({
    cloud_name: env.CLOUDINARY_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
});
