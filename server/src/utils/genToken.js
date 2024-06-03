import env from "./validateEnv.js";
import jwt from "jsonwebtoken";

export const genToken = (uid, res) => {
  const token = jwt.sign({ uid }, env.JWT_SECRET, { expiresIn: "15d" });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
    httpOnly: true,
    secure: env.NODE_ENV !== "development",
  });
};
