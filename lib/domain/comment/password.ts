import "server-only";

import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

/** IP 원문은 저장하지 않는다 — sha256(ip + salt) (docs/domain/comment/overview.md) */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.COMMENT_IP_SALT ?? "";
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex");
}
