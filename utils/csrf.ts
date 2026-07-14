
import type { Request, Response, NextFunction } from "express"
import { getCookie } from "@/utils/cookie"
import { safeEqual } from "@/utils/equal"
import crypto from "crypto"

export function csrf(req: Request, res: Response, next: NextFunction) {
    let token = getCookie(req, "csrf")

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
        token = crypto.randomBytes(32).toString('hex')

        res.cookie("csrf", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV !== "dev",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7
        })
    }

    res.locals.csrf = token
    next()
}

export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
    const cookie = getCookie(req, "csrf")
    const sent = (req.body?._csrf ?? req.get("x-csrf-token") ?? "") as string

    if (!cookie || !sent || !safeEqual(cookie, sent)) {
        return res.status(403).send("Missing CSRF token! Please reload the page!")
    }

    next()
}