// Takes an object and returns it with camelCased keys
import fetch from "node-fetch";

import Integration from "../../../backend/entities/Integration.entity";
import { AuditLog, GetLogsOptions, LogsResponse } from "../types";

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
  if (!opt.headers) opt.headers = {};
  opt.headers.cookie = `.ROBLOSECURITY=${cookie}`;
  opt.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0";
  return fetch(where, options);
}
export function parseLog (rawLog: any): AuditLog {
  const {
    actor: { user: { userId, username }, role: { name: rankName, rank } },
    created,
    actionType,
    description

  } = rawLog;
  return {
    actor: {
      id: userId,
      username,
      rank,
      rankName
    },
    created: new Date(created),
    type: actionType,
    action: camelify(description),
    rawCreated: created.split(".")[0]
  };
}

export async function getLogs (groupId: number, cookie: string, opt?: GetLogsOptions): Promise<LogsResponse> {
  const fetchUrl = new URL(`https://groups.roblox.com/v1/groups/${groupId}/audit-log`);
  if (opt) {
    for (const key of Object.keys(opt)) {
      // @ts-ignore
      if (opt[key]) {
        // @ts-ignore
        fetchUrl.searchParams.append(key, opt[key]);
      }
    }
  }
  const res = await fetch(fetchUrl, { headers: { cookie: `.ROBLOSECURITY=${cookie}` } });
  const resp = await res.json();
  if (resp.errors) {
    throw new Error(resp.errors[0].message);
  } else {
    const out: (AuditLog[]) = [];
    for (const log of resp.data) {
      out.push(parseLog(log));
    }
    // *Shouldn't* Make a difference, but roblox has changed APIs without notification before.
    out.sort((f, s) => s.created.getTime() - f.created.getTime());
    return {
      next: resp.nextPageCursor,
      prev: resp.prevPageCursor,
      logs: out
    };
  }
}
