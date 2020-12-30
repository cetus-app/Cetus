import Redis from "ioredis";

import { redis } from "./index";

const client = new Redis({ password: process.env.redisPassword ? process.env.redisPassword : undefined });

export async function getObject (key: string):Promise<any> {
  const raw = await client.get(key);
  if (typeof raw === "string") {
    return JSON.parse(raw);
  }
  return undefined;
}

export function setobject (key: string, value: any, ...options: any[]):Promise<any> {
  return client.set(key, JSON.stringify(value), ...options);
}

/**
 * Allows for multiple values to be retrieved from Redis, useful for multi-get caching. Only works for values which are
 * JSON
 * @param prefix - The Redis key prefix, which identifies the type of object you are retrieving.
 * @param ids - The IDs of the objects you want to retrieve.
 */
export async function multiGet<T> (prefix: string, ids: number[] | string[]): Promise<T[]> {
  const out: T[] = [];
  // Get cached
  const promises = [];
  for (const id of ids) {
    const key = prefix + id;
    const p = redis.get(key);
    promises.push(p);

    p.then(r => {
      if (r) {
        out.push(JSON.parse(r));
      }
    });
  }
  await Promise.all(promises);
  return out;
}

export default client;
