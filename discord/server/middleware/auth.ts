import { timingSafeEqual } from "crypto";
import { RequestHandler } from "express";

const auth: RequestHandler = (req, res, next) => {
  const token = req.header("authorization");

  if (!process.env.apiKey
    || !token
    || !(token.length === process.env.apiKey.length && timingSafeEqual(Buffer.from(token), Buffer.from(process.env.apiKey)))) {
    return res.status(404).send("Resource not found.");
  }

  return next();
};

export default auth;
