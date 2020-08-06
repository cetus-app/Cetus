import Redis from "ioredis";

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

export default client;
