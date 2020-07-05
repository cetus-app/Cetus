// Takes an object and returns it with camelCased keys
import fetch from "node-fetch";

import Integration from "../../../backend/entities/Integration.entity";

const { url, token } = process.env;

export function camelify (obj: any) {
  if (!obj) throw new Error("No object supplied to camelify");
  const keys = Object.keys(obj);
  const out: any = {};

  for (const key of keys) {
    // lowercase first char
    const newKey = key.charAt(0).toLowerCase() + key.slice(1);

    // Deal with the various value types so we lowercase nested objects too
    if (Array.isArray(obj[key])) {
      const outArr = [];
      for (const item of obj[key]) {
        outArr.push(camelify(item));
      }
      out[newKey] = outArr;
      // For some reason typeof null is "object" => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      // Try camelify it
      out[newKey] = camelify(obj[key]);
    } else {
      out[newKey] = obj[key];
    }
  }
  return out;
}
export async function getScannable (): Promise<Integration[]> {
  // This will never happen
  if (!token) throw new Error("No token!");

  const res = await fetch(`${url}/internal/scannable`, { headers: { authorization: token } });
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${await res.text()}`);
  }
  return res.json();
}
export async function makeRequest (where: string, cookie: string, options?: any) {
  const opt = options || { headers: {} };
  if (opt.headers) opt.headers = {};
  opt.headers.cookie = `.ROBLOSECURITY=${cookie}`;
  opt.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0";
  return fetch(where, options);
}
