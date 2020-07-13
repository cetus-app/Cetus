import Redis from "ioredis";

export const client = new Redis();

export async function getObject (key: string): Promise<any> {
  const raw = await client.get(key);
  if (typeof raw === "string") {
    return JSON.parse(raw);
  }
  return undefined;
}

export function setObject (key: string, value: any, ...options: any[]): Promise<any> {
  return client.set(key, JSON.stringify(value), ...options);
}

export default client;
