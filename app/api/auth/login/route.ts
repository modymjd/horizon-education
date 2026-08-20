import { NextResponse } from "next/server"
import { loginSchema } from "@/lib/validators"
import { query, pool } from "@/lib/db"
import { verifyPassword, signSession, roleHome, type Role } from "@/lib/auth"
import { rateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit"

type LoginUserRow = {
  id: number
  password_hash: string
  status: string
  role: Role
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)

    const ipLimit = rateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000)

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again in a few minutes." },
        { status: 429 }
      )
    }

    const body = loginSchema.parse(await req.json())
    const emailKey = `login:email:${body.email.trim().toLowerCase()}`

    const emailLimit = rateLimit(emailKey, 6, 15 * 60 * 1000)

    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          message:
            "Too many failed attempts for this account. Please try again in a few minutes.",
        },
        { status: 429 }
      )
    }

    const users = await query<LoginUserRow>(
      `
      SELECT
        u.id,
        u.password_hash,
        u.status,
        r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.email = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
      [body.email]
    )

    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      )
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { message: "This account is not active right now." },
        { status: 403 }
      )
    }

    const isValidPassword = await verifyPassword(
      body.password,
      user.password_hash
    )

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      )
    }

    resetRateLimit(emailKey)

    const token = await signSession({
      userId: user.id,
      role: user.role,
    })

    await pool.execute(
      `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ?
      `,
      [user.id]
    )

    const response = NextResponse.json({
      message: "Signed in successfully.",
      redirectTo: roleHome[user.role],
      role: user.role,
    })

    const isProduction = process.env.NODE_ENV === "production"

    response.cookies.set({
      name: "horizon_session",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    response.cookies.set({
      name: "horizon_role",
      value: user.role,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch (error) {
    console.error("LOGIN_ERROR", error)

    return NextResponse.json(
      { message: "Unable to sign in. Please try again." },
      { status: 500 }
    )
  }
}
