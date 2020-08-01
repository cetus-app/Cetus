import { Request } from "express";

export function getAuthFromRequest (req: Request) {
  const header = req.header("authorization");
  // Header should look like "Bearer [TOKEN]"
  const token = header && header.startsWith("Bearer") ? header.split(" ")[1] : req.cookies.token;
  return token;
}
export default getAuthFromRequest;
