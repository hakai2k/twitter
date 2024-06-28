import app from "./app";
import env from "./utils/validateEnv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

mongoose
  .connect(env.MONGO_CONN)
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running on ${env.PORT}`);
    });

    cloudinary.config({
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      cloud_name: env.CLOUDINARY_NAME,
    });
  })
  .catch(console.error);
