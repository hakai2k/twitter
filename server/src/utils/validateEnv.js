import { cleanEnv, num, port, str } from "envalid";
import "dotenv/config";

export default cleanEnv(process.env, {
  PORT: port(),
  MONGO_CONN: str(),
  NODE_ENV: str(),
  JWT_SECRET: str(),
  CLOUDINARY_NAME: str(),
  CLOUDINARY_API_SECRET: str(),
  CLOUDINARY_API_KEY: num(),
});
