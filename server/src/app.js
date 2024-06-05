import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import createHttpError, { isHttpError } from "http-errors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use((req, res, next) => {
  throw createHttpError(404, "Endpoint not found.");
});
app.use((err, req, res, next) => {
  let message = "An error has occurred. Internal server error.";
  let status = 500;
  if (isHttpError(err)) {
    message = err.message;
    status = err.status;
  }
  res.status(status).json({ ErrorMessage: message });
});

export default app;
