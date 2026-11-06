import type { Request } from "express"
import { parse } from "cookie"

export function getCookie(req: Request, name: string) {
    const header = req.headers.cookie
    if (!header) return null

    return parse(header)[name] ?? null
}
