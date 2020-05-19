import { timingSafeEqual } from "crypto";

export default function safeCompare (a:string, b:string) {
  return timingSafeEqual(Buffer.from(a), Buffer.from(b)) && a.length === b.length;
}
