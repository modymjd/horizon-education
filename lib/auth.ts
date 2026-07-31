import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

export type Role = "admin" | "teacher" | "student"

export const roleHome: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "horizon-super-secret-dev-key"
)

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signSession(payload: { userId: number; role: Role }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret)
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret)

  return payload as {
    userId: number
    role: Role
  }
}