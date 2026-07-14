
import type { NextFunction, Request, Response } from "express"
import { getCookie } from "@/utils/cookie"
import { safeEqual } from "@/utils/equal"
import { createHmac } from "crypto"

function sign(expiry: number) {
    const sig = createHmac("sha256", process.env.KEY_SIGNING!).update(String(expiry)).digest("hex")
    return `${expiry}.${sig}`
}

function verify(value: string | null) {
    if (!value) return false

    const dot = value.lastIndexOf(".")
    if (dot === -1) return false

    const expiry = Number(value.slice(0, dot))
    const sig = value.slice(dot + 1)
    if (!Number.isFinite(expiry) || expiry < Date.now()) return false

    const expec = createHmac("sha256", process.env.KEY_SIGNING!).update(String(expiry)).digest("hex")
    return safeEqual(sig, expec)
}

export function issue(res: Response) {
    const exp = Date.now() + 1000 * 60 * 60 * 12 // 12h

    res.cookie("adminn", sign(exp), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV !== "dev",
        path: "/",
        maxAge: 1000 * 60 * 60 * 12
    })
}

export function checkPassword(input: string) {
    return safeEqual(input ?? "", String(process.env.LOGIN_KEY))
}

export function isAdmin(req: Request) {
    return verify(getCookie(req, "adminn"))
}

export function reqAdmin(req: Request, res: Response, next: NextFunction) {
    if (!isAdmin(req)) return res.redirect("/admin/login")
    next()
}