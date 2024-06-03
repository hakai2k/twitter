import app from "./app.js";
import mongoose from "mongoose";
import env from "./utils/validateEnv.js";

mongoose
  .connect(env.MONGO_CONN)
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server is running on ${env.PORT}`);
    });
  })
  .catch(console.error);
