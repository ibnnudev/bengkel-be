import { randomUUID } from "crypto";
import { redis } from "./redis-client";

export const tryLockMechanic = async (mechanicId: string) => {
  const key = `lock:mechanic:${mechanicId}`;
  const value = randomUUID();

  const result = await redis.set(key, value, "EX", 30, "NX");

  return result === "OK" ? value : null;
};
