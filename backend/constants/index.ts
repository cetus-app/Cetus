// eslint-disable-next-line import/prefer-default-export
export { default as redisPrefixes } from "./redisPrefixes";
export * from "./email";
export const hashRounds = 12;
// Two weeks
export const authLife = 1209600000;
export const cetusGroupId = 6245155;

export const botGroupThreshold = 95;

export const AQUARIUS_URL = "https://verify.nezto.re";
export const AQUARIUS_VERIFY_URL = "https://verify.nezto.re/discord";
export const AQUARIUS_API_URL = `${AQUARIUS_URL}/api`;

// The number of requests a free group can make per month.
// The number of group changing requests.
export const FREE_REQUESTS = 150;

// Redis is in seconds
export const REDIS_ONE_HOUR = 60 * 60;
// Six hours
export const REDIS_STANDARD_EXP = 60 * 60 * 6;
